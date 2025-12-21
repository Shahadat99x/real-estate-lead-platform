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
    // @ts-ignore
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
    data: (data || []) as any[],
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
    data: (data || []) as any[],
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

export type DashboardOverviewFn = {
  counts: {
    activeListings: number;
    totalListings: number;
    newLeads: number;
    leads7d: number;
    leads30d: number;
    publishedRate: number | null;
  };
  recentLeads: any[]; // simpler type for dashboard display
  recentListings: any[];
};

export async function getDashboardOverview(profileId: string, role: 'ADMIN' | 'AGENT'): Promise<DashboardOverviewFn> {
  const supabase = await createServerSupabaseClient();

  // 1. Listings Stats and Recent
  let listingsQuery = supabase.from('listings').select('id, title, city, price, status, updated_at', { count: 'exact' });
  if (role !== 'ADMIN') {
    listingsQuery = listingsQuery.eq('agent_id', profileId);
  }

  // We need multiple aggregates, so we might need separate queries or a composed one.
  // For simplicity and correctness with RLS, we'll run a few efficient queries.

  // A) Recent Listings (fetch 5) & Total Count
  // clone for count
  const listingsAll = supabase.from('listings').select('status', { count: 'exact', head: true });
  const listingsPublished = supabase.from('listings').select('status', { count: 'exact', head: true }).eq('status', 'PUBLISHED');

  let baseListings = supabase.from('listings').select('*', { count: 'exact', head: true });
  if (role !== 'ADMIN') {
    baseListings = baseListings.eq('agent_id', profileId);
  }

  // B) Recent Listings
  let recentListingsQuery = supabase
    .from('listings')
    .select('id, title, city, price, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (role !== 'ADMIN') {
    recentListingsQuery = recentListingsQuery.eq('agent_id', profileId);
  }

  // C) Leads Stats
  // New Leads
  let leadsNewQuery = supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'NEW');
  // 7d
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  let leads7dQuery = supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString());
  // 30d
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  let leads30dQuery = supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString());

  // Recent Leads (fetch 5)
  // We need listing title, so we join.
  let recentLeadsQuery = supabase
    .from('leads')
    .select('id, name, email, status, created_at, listing_id, listings(title)')
    .order('created_at', { ascending: false })
    .limit(5);

  if (role !== 'ADMIN') {
    // Apply agent filter
    // For counts, we need to join listings to check agent_id if leads don't have agent_id directly (they link to listings)
    // Assuming RLS handles visibility, but for counts we might need manual filter if RLS isn't perfect or if we want to be explicit.
    // Leads usually linked to listing -> agent.
    // However, Supabase 'head' counts with inner join filters can be tricky.
    // Let's rely on the fact that we can filter using the join syntax or assume RLS.
    // Given existing patterns: query.eq('listings.agent_id', profileId) with !inner
    const agentFilter = 'listings.agent_id';

    leadsNewQuery = leadsNewQuery.eq(agentFilter, profileId); // This might fail if joined table not in select
    // Actually, simpler to trust RLS for 'head' queries if policies exist.
    // But verify: policies usually on rows. 'head' still checks policies.
    // Let's perform explicit filtering for safety if our policies need inner join.
    // The existing 'getDashboardLeads' uses !inner join.
    // For 'head' requests, we can't easily do inner join filters without selecting.
    // So we might just fetch the data or use separate counts.
    // Optimization: If agent, we filter by listings.agent_id.
    // The 'inner' hint is required for filtering by joined relation.

    // Let's use the exact same pattern as getDashboardLeads:
    // .select('..., listings!inner(...)')
    // But for count-only, we can select minimal fields.

    // Refined approach for AGENT role:
    // We will use the proper syntax: .select('id, listings!inner(agent_id)', { count: 'exact', head: true })
    // and filter listings.agent_id
    const innerSelect = 'id, listings!inner(agent_id)';

    leadsNewQuery = supabase.from('leads').select(innerSelect, { count: 'exact', head: true }).eq('status', 'NEW').eq('listings.agent_id', profileId);
    leads7dQuery = supabase.from('leads').select(innerSelect, { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()).eq('listings.agent_id', profileId);
    leads30dQuery = supabase.from('leads').select(innerSelect, { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()).eq('listings.agent_id', profileId);

    recentLeadsQuery = recentLeadsQuery.eq('listings.agent_id', profileId); // implicit join filter from select
  }

  // Listings Counts
  let totalListingsQuery = supabase.from('listings').select('id', { count: 'exact', head: true });
  let publishedListingsQuery = supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'PUBLISHED');

  if (role !== 'ADMIN') {
    totalListingsQuery = totalListingsQuery.eq('agent_id', profileId);
    publishedListingsQuery = publishedListingsQuery.eq('agent_id', profileId);
  }

  const [
    { count: totalListings },
    { count: activeListings },
    { data: recentListings },
    { count: newLeads },
    { count: leads7d },
    { count: leads30d },
    { data: recentLeads }
  ] = await Promise.all([
    totalListingsQuery,
    publishedListingsQuery,
    recentListingsQuery,
    leadsNewQuery,
    leads7dQuery,
    leads30dQuery,
    recentLeadsQuery
  ]);

  const total = totalListings || 0;
  const published = activeListings || 0;
  const rate = total > 0 ? Math.round((published / total) * 100) : null;

  return {
    counts: {
      activeListings: published,
      totalListings: total,
      newLeads: newLeads || 0,
      leads7d: leads7d || 0,
      leads30d: leads30d || 0,
      publishedRate: rate,
    },
    recentListings: (recentListings || []) as any[],
    recentLeads: (recentLeads || []) as any[],
  };
}
