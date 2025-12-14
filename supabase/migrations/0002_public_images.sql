-- Allow public read of images for published listings (safety for public detail pages).
alter table if exists public.listing_images enable row level security;

drop policy if exists "Public can read images for published listings" on public.listing_images;
create policy "Public can read images for published listings"
on public.listing_images
for select
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_images.listing_id
      and l.published_at is not null
  )
);

-- Ensure public can read active agents (idempotent if already present).
drop policy if exists "Public can read active agents" on public.agents;
create policy "Public can read active agents"
on public.agents
for select
using (is_active = true);
