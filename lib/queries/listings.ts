import { createPublicSupabaseClient } from '../supabase/public';
import type { ListingsRow } from '../../types/db';

export type ListingFilters = {
  city?: string;
  purpose?: 'BUY' | 'RENT';
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  property_type?: string;
};

export async function getFeaturedListings() {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      listing_images ( id, url, sort_order, alt_text )
    `
    )
    .eq('status', 'PUBLISHED')
    .not('published_at', 'is', null)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data ?? [];
}

export async function getListings(filters: ListingFilters) {
  const supabase = createPublicSupabaseClient();
  let query = supabase
    .from('listings')
    .select(
      `
      *,
      listing_images ( id, url, sort_order, alt_text )
    `
    )
    .eq('status', 'PUBLISHED')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });

  if (filters.city) query = query.ilike('city', `%${filters.city}%`);
  if (filters.purpose) query = query.eq('purpose', filters.purpose);
  if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
  if (filters.beds !== undefined) query = query.gte('bedrooms', filters.beds);
  if (filters.baths !== undefined) query = query.gte('bathrooms', filters.baths);
  if (filters.property_type) query = query.eq('property_type', filters.property_type);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getListingById(id: string) {
  const supabase = createPublicSupabaseClient();
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'PUBLISHED')
    .not('published_at', 'is', null)
    .single();

  const listingData = listing as ListingsRow | null;

  if (listingError || !listingData) {
    return null;
  }

  const { data: images } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', id)
    .order('sort_order', { ascending: true });

  const hasAgent = typeof listingData.agent_id === 'string';
  const { data: agent } = hasAgent
    ? await supabase.from('agents').select('*').eq('id', listingData.agent_id).maybeSingle()
    : { data: null };

  return {
    ...listingData,
    listing_images: images || [],
    agents: agent || null,
  };
}
