import { createServerSupabaseClient } from '../supabase/server';

export async function getTopAgents() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('agents')
    .select('id, display_name, bio, public_slug, is_active, service_areas')
    .eq('is_active', true)
    .limit(6);

  if (error) throw error;
  return data ?? [];
}
