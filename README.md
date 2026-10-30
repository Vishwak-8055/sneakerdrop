# SneakerDrop

Premium sneaker discovery with a waitlist for every pair. Next.js 15 (App Router) on Supabase (Postgres, Row Level Security, Storage).

## What is in this repo

- **Storefront**: home, Discover (search, category/availability filters, price/newest sorting, pagination), product pages with image gallery, release info, related pairs and a per-sneaker waitlist.
- **Waitlist API** (`POST /api/waitlist`): Zod validation, normalised email, same-origin check, honeypot, and a database-level unique constraint on (product, normalised email).
- **Database** (`supabase/`): schema, constraints, indexes, RLS, column-level grants, storage policy, seed data, and a smoke test for the security rules.
- **SEO and hardening**: per-page metadata, canonical URLs, sitemap, robots, security headers, CI build.

## Not built yet

Route-level loading skeletons (omitted on purpose: a root `loading.tsx` makes 404 and 500 responses return HTTP 200), admin dashboard (product CRUD, image upload UI, waitlist table and CSV export), confirmation emails via Resend, rate limiting, Vitest and Playwright suites, Framer Motion, Tailwind/shadcn (styling is plain CSS tokens in `src/app/globals.css`), custom web fonts (system font stacks are used). Until the admin exists, manage products in the Supabase Table Editor.

## Deploy

**1. Supabase**
1. Create a project at supabase.com.
2. SQL Editor: run `supabase/migrations/20261030000000_init.sql`, then `supabase/seed.sql`.
3. Authentication → turn off "Allow new users to sign up". Add your own user, then run the provisioning SQL at the bottom of the migration.
4. Project Settings → API: copy the project URL and the anon (or publishable) key.

**2. GitHub**
```bash
git init -b main
git add .
git commit -m "feat: SneakerDrop storefront, waitlist and database schema"
git remote add origin https://github.com/<you>/sneakerdrop.git
git push -u origin main
```

**3. Vercel**
1. New Project → import the repo (framework is detected automatically).
2. Add the variables from `.env.example`.
3. Deploy. Then set `NEXT_PUBLIC_SITE_URL` to the production URL and redeploy; `NEXT_PUBLIC_*` values are baked in at build time.

**4. Check it**
Open `/`, `/discover` and a product. Submit the waitlist form twice with the same email: the second attempt should say you are already on the list. In Supabase, `waitlist_subscriptions` should show one row.

## Local development

```bash
cp .env.example .env.local   # fill in your Supabase values
npm install
npm run dev
```

## Images

Upload files to the public `product-images` bucket and add rows to `product_images` with `image_url` set to the object path (for example `field-runner-01/front.jpg`). No images are seeded.

## Security model

The app only ever holds the anon key. Visitors can read the catalogue and insert a waitlist row (only `product_id`, `email`, `confirmation_token_hash` are writable); they cannot read the waitlist or write products. Staff and admin roles come from `admin_profiles`. Run `supabase/tests/rls_smoke.sql` (with `local_stub.sql` on plain Postgres) to re-check these rules. Add rate limiting before launch, for example with Vercel Firewall rules or Upstash.

## Caching

Product pages are cached for 60 seconds, so edits can take up to a minute to appear. Home, Discover and the sitemap render on every request.
