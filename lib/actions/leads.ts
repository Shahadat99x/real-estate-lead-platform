'use server';

import { revalidatePath } from 'next/cache';
import { createPublicSupabaseClient } from '../supabase/public';
import { createServiceRoleClient } from '../supabase/service';
import { requireUser, getCurrentProfile } from '../authz';

export async function createLead(_prev: any, formData: FormData) {
  const listingId = String(formData.get('listing_id') || '');
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const honeypot = String(formData.get('company') || '');

  // Spam check
  if (honeypot) return { ok: true }; // Silent success for bots

  if (!listingId) return { error: 'Invalid listing' };
  if (!name) return { error: 'Name is required' };
  if (!email && !phone) return { error: 'Email or phone is required' };
  if (!message) return { error: 'Message is required' };

  // Use PUBLIC client for anonymity
  const supabase = createPublicSupabaseClient();
  const { error } = await supabase.from('leads').insert({
    listing_id: listingId,
    name,
    email,
    phone: phone || null,
    message,
    status: 'NEW',
  });

  if (error) {
    console.error('Create Lead Error:', error);
    return { error: 'Failed to send message. Please try again.' };
  }

  return { success: true };
}

// Dashboard Actions - Using service role client with manual authorization

export async function setLeadStatusAction(formData: FormData) {
  console.log('[setLeadStatusAction] Called');
  if (!(formData instanceof FormData)) {
    console.error('[setLeadStatusAction] Invalid formData:', formData);
    return { error: 'Invalid form submission' };
  }

  const user = await requireUser();
  const profile = await getCurrentProfile();
  const supabase = createServiceRoleClient();

  const leadId = String(formData.get('leadId') || '');
  const status = String(formData.get('status') || '');

  console.log('[setLeadStatusAction] Data:', { leadId, status, userId: user.id });

  if (!leadId || !status) return { error: 'Missing required fields' };

  // Verify user has access to this lead (via listing ownership or admin)
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('id, listing_id, listings!inner(agent_id)')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    console.error('[setLeadStatusAction] Lead not found:', fetchError);
    return { error: 'Lead not found' };
  }

  // Check authorization: admin can access all, agent can only access own listings
  const isAdmin = profile?.role === 'ADMIN';
  const isOwner = (lead.listings as any)?.agent_id === user.id;

  if (!isAdmin && !isOwner) {
    console.error('[setLeadStatusAction] Unauthorized:', { isAdmin, isOwner, agentId: (lead.listings as any)?.agent_id });
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('leads')
    .update({
      status,
      last_contacted_at: status === 'CONTACTED' ? new Date().toISOString() : null
    })
    .eq('id', leadId);

  if (error) {
    console.error('[setLeadStatusAction] DB Error:', error);
    return { error: 'Failed to update status' };
  }

  console.log('[setLeadStatusAction] Success');
  revalidatePath('/dashboard/leads');
  return { ok: true };
}

export async function updateLeadNotesAction(formData: FormData) {
  console.log('[updateLeadNotesAction] Called');
  if (!(formData instanceof FormData)) {
    return { error: 'Invalid form submission' };
  }

  const user = await requireUser();
  const profile = await getCurrentProfile();
  const supabase = createServiceRoleClient();

  const leadId = String(formData.get('leadId') || '');
  const notes = String(formData.get('notes') || '');

  console.log('[updateLeadNotesAction] Data:', { leadId, notesLength: notes.length });

  if (!leadId) return { error: 'Missing ID' };

  // Verify user has access to this lead
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('id, listing_id, listings!inner(agent_id)')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    console.error('[updateLeadNotesAction] Lead not found:', fetchError);
    return { error: 'Lead not found' };
  }

  const isAdmin = profile?.role === 'ADMIN';
  const isOwner = (lead.listings as any)?.agent_id === user.id;

  if (!isAdmin && !isOwner) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('leads')
    .update({ notes })
    .eq('id', leadId);

  if (error) {
    console.error('[updateLeadNotesAction] DB Error:', error);
    return { error: 'Failed to save notes' };
  }

  console.log('[updateLeadNotesAction] Success');
  revalidatePath('/dashboard/leads');
  return { ok: true };
}

export async function deleteLeadAction(formData: FormData) {
  console.log('[deleteLeadAction] Called');
  if (!(formData instanceof FormData)) {
    return { error: 'Invalid form submission' };
  }

  const user = await requireUser();
  const profile = await getCurrentProfile();
  const supabase = createServiceRoleClient();

  const leadId = String(formData.get('leadId') || '');

  console.log('[deleteLeadAction] LeadId:', leadId);

  if (!leadId) return { error: 'Missing ID' };

  // Verify user has access to this lead
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('id, listing_id, listings!inner(agent_id)')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    console.error('[deleteLeadAction] Lead not found:', fetchError);
    return { error: 'Lead not found' };
  }

  const isAdmin = profile?.role === 'ADMIN';
  const isOwner = (lead.listings as any)?.agent_id === user.id;

  if (!isAdmin && !isOwner) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (error) {
    console.error('[deleteLeadAction] DB Error:', error);
    return { error: 'Failed to delete lead' };
  }

  console.log('[deleteLeadAction] Success');
  revalidatePath('/dashboard/leads');
  return { ok: true };
}
