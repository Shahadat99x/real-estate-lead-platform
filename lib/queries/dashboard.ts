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
