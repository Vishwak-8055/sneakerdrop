-- Run after the migration and seed. Everything happens in one transaction that is rolled back.
-- psql -v ON_ERROR_STOP=1 -f supabase/tests/rls_smoke.sql
\set ON_ERROR_STOP on
begin;

create function public.test_expect_error(stmt text, expected text) returns void
language plpgsql as $$
declare ok boolean := false;
begin
  begin
    execute stmt;
  exception when others then
    if sqlstate <> expected then
      raise exception 'expected % but got % (%): %', expected, sqlstate, sqlerrm, stmt;
    end if;
    ok := true;
  end;
  if not ok then
    raise exception 'expected % but statement succeeded: %', expected, stmt;
  end if;
end $$;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@test.local'),
  ('00000000-0000-0000-0000-0000000000a2', 'editor@test.local'),
  ('00000000-0000-0000-0000-0000000000a3', 'visitor@test.local');
insert into public.admin_profiles (auth_user_id, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin'),
  ('00000000-0000-0000-0000-0000000000a2', 'editor');

\o /dev/null

-- Table constraints
select public.test_expect_error($$insert into public.products (slug,name,brand,price,category,color,availability_status) values ('x1','X','B',1,'running','c','upcoming')$$, '23514');
select public.test_expect_error($$insert into public.products (slug,name,brand,price,original_price,category,color) values ('x2','X','B',100,50,'running','c')$$, '23514');
select public.test_expect_error($$insert into public.products (slug,name,brand,price,category,color) values ('Bad Slug','X','B',1,'running','c')$$, '23514');
select public.test_expect_error($$insert into public.waitlist_subscriptions (product_id,email) select id,'not-an-email' from public.products limit 1$$, '23514');

-- Duplicate prevention on normalized email + product; same email on another product is fine
insert into public.waitlist_subscriptions (product_id, email)
  select id, 'Fan@Example.com' from public.products where slug = 'field-runner-01';
select public.test_expect_error($$insert into public.waitlist_subscriptions (product_id,email) select id,'fan@example.COM' from public.products where slug='field-runner-01'$$, '23505');
insert into public.waitlist_subscriptions (product_id, email)
  select id, 'Fan@Example.com' from public.products where slug = 'court-high-86';

-- Anonymous visitor
set local role anon;
do $$ begin assert (select count(*) from public.products) = 5, 'anon cannot read catalogue'; end $$;
select public.test_expect_error($$select * from public.waitlist_subscriptions$$, '42501');
select public.test_expect_error($$insert into public.products (slug,name,brand,price,category,color) values ('hack','H','H',1,'trail','c')$$, '42501');
select public.test_expect_error($$update public.products set featured = true$$, '42501');
select public.test_expect_error($$delete from public.products$$, '42501');
insert into public.waitlist_subscriptions (product_id, email, confirmation_token_hash)
  select id, 'anon@example.com', 'hash-anon-1' from public.products where slug = 'court-high-86';
select public.test_expect_error($$insert into public.waitlist_subscriptions (product_id,email,status) select id,'x@example.com','confirmed' from public.products limit 1$$, '42501');
reset role;

-- Signed-in user with no admin profile
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a3';
select public.test_expect_error($$insert into public.products (slug,name,brand,price,category,color) values ('hack','H','H',1,'trail','c')$$, '42501');
do $$ begin assert (select count(*) from public.waitlist_subscriptions) = 0, 'non-staff can read waitlist'; end $$;
reset role;

-- Editor: can write products, cannot delete them, cannot read the waitlist
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a2';
insert into public.products (slug,name,brand,price,category,color) values ('editor-test','E','B',10,'lifestyle','c');
update public.products set featured = true where slug = 'editor-test';
do $$ declare n integer; begin
  delete from public.products where slug = 'editor-test';
  get diagnostics n = row_count;
  assert n = 0, 'editor was able to delete a product';
end $$;
do $$ begin assert (select count(*) from public.waitlist_subscriptions) = 0, 'editor can read waitlist'; end $$;
reset role;

-- Admin: full access, and activity-log rows cannot be attributed to someone else
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000a1';
do $$ begin assert (select count(*) from public.waitlist_subscriptions) = 3, 'admin cannot read waitlist'; end $$;
do $$ declare n integer; begin
  delete from public.products where slug = 'editor-test';
  get diagnostics n = row_count;
  assert n = 1, 'admin could not delete a product';
end $$;
insert into public.admin_activity_logs (admin_id, action, entity_type)
  values (public.current_admin_id(), 'product.delete', 'product');
select public.test_expect_error($$insert into public.admin_activity_logs (admin_id, action, entity_type) select id, 'forged', 'product' from public.admin_profiles where role = 'editor'$$, '42501');
reset role;

-- Token confirmation: single use, rejects unknown and expired tokens
insert into public.waitlist_subscriptions (product_id, email, confirmation_token_hash, created_at)
  select id, 'old@example.com', 'hash-old', now() - interval '8 days'
  from public.products where slug = 'court-high-86';
set local role anon;
do $$ begin
  assert public.confirm_waitlist_subscription('hash-anon-1'), 'confirmation failed';
  assert not public.confirm_waitlist_subscription('hash-anon-1'), 'token reusable';
  assert not public.confirm_waitlist_subscription('nope'), 'bad token accepted';
  assert not public.confirm_waitlist_subscription('hash-old'), 'expired token accepted';
end $$;
reset role;
do $$ begin
  assert (select status from public.waitlist_subscriptions where email = 'anon@example.com') = 'confirmed';
  assert (select confirmation_token_hash from public.waitlist_subscriptions where email = 'anon@example.com') is null;
end $$;

\o
select 'ALL SMOKE CHECKS PASSED' as result;
rollback;
