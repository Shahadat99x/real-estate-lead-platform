import { createServerSupabaseClient } from '../supabase/server';
import { getCurrentProfile } from '../authz';

export async function getOrCreateAgentForCurrentUser() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Not authenticated');
  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase.from('agents').select('id').eq('id', profile.id).maybeSingle();
  if (existing?.id) return existing.id;

  const slug = `agent-${profile.id.slice(0, 6)}-${Math.floor(Math.random() * 1000)}`;
  const { data, error } = await supabase
    .from('agents')
    .insert({
      id: profile.id,
      display_name: profile.full_name || 'Agent',
      bio: 'New agent profile',
      languages: ['English'],
      service_areas: [],
      is_active: true,
      public_slug: slug,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export type DashboardListingParams = {
  profileId: string;
  role: 'ADMIN' | 'AGENT';
  q?: string;
  status?: string;
  purpose?: string;
  featured?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function getDashboardListings({
  profileId,
  role,
  q,
  status,
  purpose,
  featured,
  sort = 'newest',
  page = 1,
  pageSize = 20,
}: DashboardListingParams) {
  const supabase = await createServerSupabaseClient();

  // Base query
  let query = supabase
    .from('listings')
    .select('id, title, city, price, purpose, property_type, status, featured, updated_at, published_at, agent_id', { count: 'exact' });

  // Role Scoping
  if (role !== 'ADMIN') {
    query = query.eq('agent_id', profileId);
  }

  // Search (Title or City) - Case insensitive partial match
  if (q) {
    query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%`);
  }

  // Filters
  if (status && status !== 'ALL') {
    if (status === 'PUBLISHED') {
      // Must be published status AND have a published_at date (defensive)
      query = query.eq('status', 'PUBLISHED').not('published_at', 'is', null);
    } else if (status === 'DRAFT') {
      // DRAFT or null published_at
      query = query.or('status.eq.DRAFT,published_at.is.null');
    }
  }

  if (purpose && purpose !== 'ALL') {
    query = query.eq('purpose', purpose);
  }

  if (role === 'ADMIN' && featured && featured !== 'ALL') {
    if (featured === 'YES') query = query.eq('featured', true);
    if (featured === 'NO') query = query.eq('featured', false);
  }

  // Sorting
  switch (sort) {
    case 'price_low':
      query = query.order('price', { ascending: true });
      break;
    case 'price_high':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('updated_at', { ascending: false });
      break;
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

export async function getListingForEdit(id: string, profileId: string, role: 'ADMIN' | 'AGENT') {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('listings').select('*').eq('id', id).maybeSingle();
  if (role !== 'ADMIN') {
    query = query.eq('agent_id', profileId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export type DashboardLeadParams = {
  profileId: string;
  role: 'ADMIN' | 'AGENT';
  q?: string;
  status?: string;
  listingId?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function getDashboardLeads({
  profileId,
  role,
  q,
  status,
  listingId,
  sort = 'newest',
  page = 1,
  pageSize = 20,
}: DashboardLeadParams) {
  const supabase = await createServerSupabaseClient();

  // We select leads and the related listing info
  // Note: Listings might be null if deleted, though referential integrity should prevent orphan leads usually.
  let query = supabase
    .from('leads')
    .select('id, name, email, phone, message, status, created_at, notes, last_contacted_at, listings!inner(id, title, city, price, agent_id)', { count: 'exact' });

  // Role Scoping
  if (role !== 'ADMIN') {
    // Check if the related listing belongs to this agent
    // "listings!inner" enforces INNER JOIN, filtering leads that don't match the listing filter
    query = query.eq('listings.agent_id', profileId);
  }

  // Search
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  // Filters
  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }

  if (listingId && listingId !== 'ALL') {
    query = query.eq('listing_id', listingId);
  }

  // Sort
  if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

export async function getListingForMedia(id: string) {
  const supabase = createServerSupabaseClient();
  const client = await supabase;

  // Auth is handled by createServerSupabaseClient (cookies) + RLS
  const { data: listing, error } = await client
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !listing) {
    return null;
  }

  // Fetch images sorted
  const { data: images } = await client
    .from('listing_images')
    .select('*')
    .eq('listing_id', id)
    .order('sort_order', { ascending: true });

  return {
    ...listing,
    listing_images: images || [],
  };
}
