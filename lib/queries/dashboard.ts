import { createServerSupabaseClient } from '../supabase/server';

export async function ensureAgent(profileId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase.from('agents').select('id').eq('id', profileId).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('agents')
    .insert({
      id: profileId,
      display_name: 'Agent',
      bio: 'New agent profile',
      languages: ['English'],
      service_areas: [],
      is_active: true,
      public_slug: `agent-${profileId.slice(0, 6)}`,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function getDashboardListings(profileId: string, role: 'ADMIN' | 'AGENT') {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from('listings')
    .select('id, title, city, price, purpose, status, featured, updated_at, agent_id')
    .order('updated_at', { ascending: false });
  if (role !== 'ADMIN') {
    query = query.eq('agent_id', profileId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
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
