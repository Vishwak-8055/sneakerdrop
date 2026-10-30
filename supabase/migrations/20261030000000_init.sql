-- SneakerDrop · 0001 · schema, RLS, grants, storage policy
-- Target: Supabase Postgres 15+. Apply with `supabase db push` or the SQL editor.

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── Tables ──────────────────────────────────────────────────────────────────

create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique
                        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  name                text not null check (length(btrim(name)) between 1 and 120),
  brand               text not null check (length(btrim(brand)) between 1 and 80),
  description         text not null default '' check (length(description) <= 4000),
  price               numeric(10,2) not null check (price >= 0),
  original_price      numeric(10,2) check (original_price is null or original_price >= price),
  category            text not null
                        check (category in ('lifestyle','running','basketball','skate','trail')),
  color               text not null check (length(btrim(color)) between 1 and 80),
  availability_status text not null default 'available'
                        check (availability_status in ('available','upcoming','unavailable')),
  featured            boolean not null default false,
  release_date        date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  search_vector       tsvector generated always as (
                        to_tsvector('simple', name || ' ' || brand || ' ' || color || ' ' || category)
                      ) stored,
  constraint upcoming_requires_release_date
    check (availability_status <> 'upcoming' or release_date is not null)
);
create index products_search_idx         on public.products using gin (search_vector);
create index products_status_release_idx on public.products (availability_status, release_date);
create index products_category_idx       on public.products (category);
create index products_created_idx        on public.products (created_at desc);
create index products_featured_idx       on public.products (created_at desc) where featured;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  image_url     text not null check (length(image_url) between 1 and 2048),
  alt_text      text not null check (length(btrim(alt_text)) between 1 and 300),
  display_order integer not null default 0 check (display_order >= 0),
  -- deferred so a reorder can swap positions inside one transaction
  constraint product_images_order_unique unique (product_id, display_order)
    deferrable initially deferred
);

create table public.waitlist_subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  product_id              uuid not null references public.products(id) on delete cascade,
  email                   text not null check (
                            length(email) <= 254
                            and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  email_normalized        text generated always as (lower(btrim(email))) stored,
  status                  text not null default 'pending'
                            check (status in ('pending','confirmed','unsubscribed')),
  confirmation_token_hash text,  -- sha256 of the emailed token; the raw token is never stored
  created_at              timestamptz not null default now(),
  confirmed_at            timestamptz,
  constraint waitlist_one_per_email_per_product unique (product_id, email_normalized),
  constraint waitlist_confirmed_has_timestamp
    check (status <> 'confirmed' or confirmed_at is not null)
);
create index waitlist_created_idx on public.waitlist_subscriptions (created_at desc);
create index waitlist_status_idx  on public.waitlist_subscriptions (status);
create unique index waitlist_token_hash_idx
  on public.waitlist_subscriptions (confirmation_token_hash)
  where confirmation_token_hash is not null;

create table public.admin_profiles (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role         text not null default 'editor' check (role in ('admin','editor')),
  created_at   timestamptz not null default now()
);

create table public.admin_activity_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.admin_profiles(id) on delete set null,
  action      text not null check (length(action) between 1 and 80),
  entity_type text not null check (length(entity_type) between 1 and 80),
  entity_id   uuid,
  created_at  timestamptz not null default now()
);
create index admin_activity_created_idx on public.admin_activity_logs (created_at desc);
create index admin_activity_admin_idx   on public.admin_activity_logs (admin_id);

-- ── Authorization helpers (security definer so policies don't recurse) ──────
-- is_staff(): any admin_profiles row (admin or editor). is_admin(): role = 'admin'.

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_profiles where auth_user_id = (select auth.uid()));
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_profiles
                 where auth_user_id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.current_admin_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.admin_profiles where auth_user_id = (select auth.uid());
$$;

revoke all on function public.is_staff(), public.is_admin(), public.current_admin_id()
  from public, anon;
grant execute on function public.is_staff(), public.is_admin(), public.current_admin_id()
  to authenticated;

-- Confirmation runs as definer so the public never needs UPDATE on the waitlist.
-- The caller passes the sha256 hash of the token from the email link; tokens expire after 7 days.
create or replace function public.confirm_waitlist_subscription(p_token_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_rows integer;
begin
  update public.waitlist_subscriptions
     set status = 'confirmed', confirmed_at = now(), confirmation_token_hash = null
   where confirmation_token_hash = p_token_hash
     and status = 'pending'
     and created_at > now() - interval '7 days';
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end $$;
revoke all on function public.confirm_waitlist_subscription(text) from public;
grant execute on function public.confirm_waitlist_subscription(text) to anon, authenticated;

-- ── Grants (least privilege: strip Supabase's defaults, then add back) ──────

revoke all on public.products, public.product_images, public.waitlist_subscriptions,
              public.admin_profiles, public.admin_activity_logs
  from anon, authenticated;

grant select on public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.products, public.product_images to authenticated;

-- Public visitors may only supply these three columns; status/confirmed_at are not writable.
grant insert (product_id, email, confirmation_token_hash)
  on public.waitlist_subscriptions to anon, authenticated;
grant select, update, delete on public.waitlist_subscriptions to authenticated;

grant select on public.admin_profiles to authenticated;
grant select, insert on public.admin_activity_logs to authenticated;

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table public.products              enable row level security;
alter table public.product_images        enable row level security;
alter table public.waitlist_subscriptions enable row level security;
alter table public.admin_profiles        enable row level security;
alter table public.admin_activity_logs   enable row level security;

create policy products_public_read on public.products
  for select to anon, authenticated using (true);
create policy products_staff_insert on public.products
  for insert to authenticated with check (public.is_staff());
create policy products_staff_update on public.products
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy products_admin_delete on public.products
  for delete to authenticated using (public.is_admin());

create policy images_public_read on public.product_images
  for select to anon, authenticated using (true);
create policy images_staff_insert on public.product_images
  for insert to authenticated with check (public.is_staff());
create policy images_staff_update on public.product_images
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy images_staff_delete on public.product_images
  for delete to authenticated using (public.is_staff());

-- No public SELECT policy exists on the waitlist: visitors can insert, never read.
create policy waitlist_public_insert on public.waitlist_subscriptions
  for insert to anon, authenticated
  with check (status = 'pending' and confirmed_at is null);
create policy waitlist_admin_select on public.waitlist_subscriptions
  for select to authenticated using (public.is_admin());
create policy waitlist_admin_update on public.waitlist_subscriptions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy waitlist_admin_delete on public.waitlist_subscriptions
  for delete to authenticated using (public.is_admin());

create policy admin_profiles_read on public.admin_profiles
  for select to authenticated
  using (auth_user_id = (select auth.uid()) or public.is_admin());

create policy activity_staff_read on public.admin_activity_logs
  for select to authenticated using (public.is_staff());
create policy activity_staff_insert on public.admin_activity_logs
  for insert to authenticated
  with check (public.is_staff() and admin_id = public.current_admin_id());

-- ── Storage: public-read bucket, staff-only writes, 5 MB image-only limit ───

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy product_images_staff_write on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

-- ── First-admin provisioning (run once in the SQL editor, never from the app) ─
-- 1. Supabase Dashboard → Authentication → disable "Allow new users to sign up".
-- 2. Authentication → Users → "Add user" with your email and a strong password.
-- 3. Then run (replace the email):
--
--   insert into public.admin_profiles (auth_user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com';
