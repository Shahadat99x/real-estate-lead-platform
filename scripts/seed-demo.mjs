#!/usr/bin/env node
// Seed demo data into Supabase using service role key.
// Idempotent-ish: reuses existing agent for ADMIN_EMAIL and wipes/recreates their listings.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load local env (use .env.local to mirror Next.js local setup).
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required. Aborting.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed in production (NODE_ENV=production).');
  process.exit(1);
}

if (!SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is required. Aborting.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('Seeding demo data...');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', ADMIN_EMAIL)
    .single();

  if (profileError || !profile) {
    throw new Error(`Admin profile not found for email ${ADMIN_EMAIL}. Create user first.`);
  }

  const agentSlug = `demo-agent-${profile.id.substring(0, 6)}`;

  // Upsert agent bound to admin profile.
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .upsert(
      {
        id: profile.id,
        display_name: profile.full_name || 'Demo Agent',
        bio: 'Experienced agent specializing in premium urban and coastal properties.',
        languages: ['English', 'Spanish'],
        service_areas: ['Madrid', 'Barcelona', 'Valencia'],
        is_active: true,
        public_slug: agentSlug,
        avatar_url: null,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (agentError || !agent) throw agentError;
  console.log(`Using agent ${agent.id} (${agent.public_slug})`);

  // Reset listings for this agent to avoid duplicates.
  await supabase.from('listings').delete().eq('agent_id', agent.id);

  const baseListings = [
    {
      title: 'Modern Downtown Loft',
      purpose: 'RENT',
      property_type: 'APARTMENT',
      price: 2200,
      city: 'Madrid',
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 95,
      featured: true,
    },
    {
      title: 'Coastal Family Home',
      purpose: 'BUY',
      property_type: 'HOUSE',
      price: 540000,
      city: 'Valencia',
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 210,
      featured: true,
    },
    {
      title: 'City Studio Retreat',
      purpose: 'RENT',
      property_type: 'STUDIO',
      price: 950,
      city: 'Barcelona',
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 40,
      featured: false,
    },
    {
      title: 'Luxury Penthouse',
      purpose: 'BUY',
      property_type: 'APARTMENT',
      price: 880000,
      city: 'Madrid',
      bedrooms: 3,
      bathrooms: 3,
      area_sqm: 160,
      featured: true,
    },
    {
      title: 'Suburban Townhouse',
      purpose: 'BUY',
      property_type: 'TOWNHOUSE',
      price: 360000,
      city: 'Seville',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 140,
      featured: false,
    },
    {
      title: 'Countryside Cottage',
      purpose: 'RENT',
      property_type: 'HOUSE',
      price: 1300,
      city: 'Granada',
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 120,
      featured: false,
    },
  ];

  const now = new Date();
  const listingsToInsert = baseListings.map((item, idx) => ({
    id: crypto.randomUUID(),
    agent_id: agent.id,
    title: item.title,
    description: `${item.title} in ${item.city}. Move-in ready with modern finishes.`,
    purpose: item.purpose,
    property_type: item.property_type,
    status: 'PUBLISHED',
    price: item.price,
    currency: 'EUR',
    city: item.city,
    address: null,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    area_sqm: item.area_sqm,
    lat: null,
    lng: null,
    featured: item.featured,
    published_at: new Date(now.getTime() - idx * 3600_000).toISOString(),
  }));

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .insert(listingsToInsert)
    .select();

  if (listingsError) throw listingsError;
  console.log(`Inserted ${listings.length} listings`);

  const imagesPayload = listings.flatMap((listing) => {
    const first = {
      id: crypto.randomUUID(),
      listing_id: listing.id,
      url: `https://picsum.photos/seed/${listing.id}-1/1200/800`,
      public_id: null,
      sort_order: 0,
      alt_text: `${listing.title} exterior`,
    };
    const second = {
      id: crypto.randomUUID(),
      listing_id: listing.id,
      url: `https://picsum.photos/seed/${listing.id}-2/1200/800`,
      public_id: null,
      sort_order: 1,
      alt_text: `${listing.title} interior`,
    };
    return [first, second];
  });

  const { error: imagesError } = await supabase.from('listing_images').insert(imagesPayload);
  if (imagesError) throw imagesError;

  console.log('Seed completed.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
