-- Initial schema for real estate platform (Supabase).
-- Includes auth-bound profiles, agents, listings, images, leads, RLS policies, and helper functions.

-- Extensions
create extension if not exists "pgcrypto";

-- =====================
-- Tables (profiles first)
-- =====================
-- Profiles mirror auth.users; role drives authorization.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'AGENT' check (role in ('ADMIN','AGENT')),
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
comment on table public.profiles is 'Auth-bound profile; role is the primary RBAC lever.';

-- Agents share UUID with profiles (1:1, no duplication of identity).
create table public.agents (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  bio text,
  languages text[] not null default '{}'::text[],
  service_areas text[] not null default '{}'::text[],
  is_active boolean not null default true,
  public_slug text unique not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Listings authored by agents.
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  title text not null,
  description text,
  purpose text not null check (purpose in ('BUY','RENT')),
  property_type text not null check (property_type in ('APARTMENT','HOUSE','STUDIO','TOWNHOUSE','VILLA','LAND')),
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  price integer not null check (price >= 0),
  currency text not null default 'EUR',
  city text not null,
  address text,
  bedrooms integer,
  bathrooms integer,
  area_sqm numeric,
  lat numeric,
  lng numeric,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint listings_published_requires_date check (status <> 'PUBLISHED' or published_at is not null)
);

-- Listing images (Cloudinary metadata only).
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  public_id text,
  sort_order integer not null default 0,
  alt_text text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Leads submitted by visitors for specific listings.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

-- ===========================
-- Triggers and trigger helpers
-- ===========================
-- Timestamp helper used by updated_at triggers.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- updated_at triggers
create trigger set_updated_at_profiles
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_agents
before update on public.agents
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_listings
before update on public.listings
for each row execute procedure public.set_updated_at();

-- Auto-provision profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email, phone, avatar_url)
  values (
    new.id,
    'AGENT',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ===================
-- Helper auth functions
-- ===================
-- Expose auth.uid() in SQL.
create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid();
$$;

-- Admin check; must be defined after profiles table exists.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'ADMIN'
  );
$$;

-- ==========
-- RLS enable
-- ==========
-- RLS
alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.leads enable row level security;

-- ========
-- Policies
-- ========
-- Profiles policies
create policy profiles_admin_all
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

create policy profiles_self_read
on public.profiles
for select
using (id = public.current_user_id());

create policy profiles_self_update
on public.profiles
for update
using (id = public.current_user_id())
with check (id = public.current_user_id());

-- Agents policies
create policy agents_public_active_read
on public.agents
for select
using (is_active);

create policy agents_self_read
on public.agents
for select
using (id = public.current_user_id());

create policy agents_self_write
on public.agents
for insert
with check (id = public.current_user_id());

create policy agents_self_update
on public.agents
for update
using (id = public.current_user_id())
with check (id = public.current_user_id());

create policy agents_self_delete
on public.agents
for delete
using (id = public.current_user_id());

create policy agents_admin_all
on public.agents
for all
using (public.is_admin())
with check (public.is_admin());

-- Listings policies
create policy listings_public_published_read
on public.listings
for select
using (status = 'PUBLISHED' and published_at is not null);

create policy listings_owner_read
on public.listings
for select
using (agent_id = public.current_user_id());

create policy listings_owner_insert
on public.listings
for insert
with check (agent_id = public.current_user_id());

create policy listings_owner_update
on public.listings
for update
using (agent_id = public.current_user_id())
with check (agent_id = public.current_user_id());

create policy listings_owner_delete
on public.listings
for delete
using (agent_id = public.current_user_id());

create policy listings_admin_all
on public.listings
for all
using (public.is_admin())
with check (public.is_admin());

-- Listing images policies
create policy listing_images_public_published_read
on public.listing_images
for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.status = 'PUBLISHED'
      and l.published_at is not null
  )
);

create policy listing_images_owner_read
on public.listing_images
for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.agent_id = public.current_user_id()
  )
);

create policy listing_images_owner_write
on public.listing_images
for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.agent_id = public.current_user_id()
  )
);

create policy listing_images_owner_update
on public.listing_images
for update
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.agent_id = public.current_user_id()
  )
)
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.agent_id = public.current_user_id()
  )
);

create policy listing_images_owner_delete
on public.listing_images
for delete
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.agent_id = public.current_user_id()
  )
);

create policy listing_images_admin_all
on public.listing_images
for all
using (public.is_admin())
with check (public.is_admin());

-- Leads policies
create policy leads_public_insert_for_published
on public.leads
for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.status = 'PUBLISHED'
      and l.published_at is not null
  )
);

create policy leads_owner_read
on public.leads
for select
using (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.agent_id = public.current_user_id()
  )
);

create policy leads_admin_all
on public.leads
for all
using (public.is_admin())
with check (public.is_admin());

-- =======
-- Indexes
-- =======
-- Indexes for common filters and sorts
create index listings_published_at_idx on public.listings (published_at desc);
create index listings_city_idx on public.listings (city);
create index listings_purpose_idx on public.listings (purpose);
create index listings_property_type_idx on public.listings (property_type);
create index listings_price_idx on public.listings (price);
create index listings_bedrooms_idx on public.listings (bedrooms);
create index listings_bathrooms_idx on public.listings (bathrooms);
create index listings_featured_idx on public.listings (featured);
create index listings_agent_idx on public.listings (agent_id);

create index listing_images_listing_sort_idx on public.listing_images (listing_id, sort_order);

create index leads_listing_created_idx on public.leads (listing_id, created_at desc);
