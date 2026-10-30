-- SneakerDrop seed data. Idempotent: safe to run more than once.
-- Brands and models are fictional. No images are seeded; upload them from the admin
-- dashboard (or the product-images bucket) so every image is one you have rights to.

insert into public.products
  (slug, name, brand, description, price, original_price, category, color,
   availability_status, featured, release_date)
values
  ('field-runner-01', 'Field Runner 01', 'Kōyō Atelier',
   'A road-to-trail runner with a one-piece engineered upper and a rockered midsole that rolls through the stride instead of slapping the ground. Bone leather overlays, moss suede toe.',
   185.00, null, 'running', 'Bone / Moss', 'available', true, null),

  ('court-high-86', 'Court High 86', 'Meridian Works',
   'A reissue of the 1986 court silhouette: full-grain leather, stitched-down panels and a gum-wrapped cupsole. The signal orange lining only shows when the collar flexes.',
   210.00, 240.00, 'basketball', 'Ink / Signal Orange', 'available', true, null),

  ('trail-07', 'Trail 07', 'Nocturne Lab',
   'A low-cut trail shoe built for mobility on technical ground. Graphite ripstop, a reflective heel tab and a 5 mm lug pattern tuned for wet rock.',
   225.00, null, 'trail', 'Graphite', 'upcoming', true, current_date + 21),

  ('low-02-chalk', 'Low 02 "Chalk"', 'Mono Atelier',
   'The quietest shoe in the lineup. Tumbled chalk leather, tonal stitching and a stacked-leather heel. Released in small runs, so sizes go quickly.',
   165.00, null, 'lifestyle', 'Chalk White', 'available', false, null),

  ('harbor-skate-pro', 'Harbor Skate Pro', 'Harbor & Line',
   'A vulcanized skate shoe with a double-stitched suede upper and a cushioned insole. The last run sold through; a restock is under review.',
   120.00, null, 'skate', 'Navy / Cream', 'unavailable', false, null)
on conflict (slug) do nothing;
