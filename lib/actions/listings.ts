"use server";

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '../supabase/server';
import { ensureAgent } from '../queries/dashboard';
import { getCurrentProfile } from '../authz';

const toInt = (val: FormDataEntryValue | null) => {
  const num = Number(val);
  return Number.isNaN(num) ? null : Math.trunc(num);
};
const toNumber = (val: FormDataEntryValue | null) => {
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
};

export async function createListingAction(_: any, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Not authenticated' };

  const supabase = await createServerSupabaseClient();
  const agentId = await ensureAgent(profile.id);

  const title = String(formData.get('title') || '').trim();
  const city = String(formData.get('city') || '').trim();
  const price = toInt(formData.get('price'));
  const purpose = String(formData.get('purpose') || '');
  const property_type = String(formData.get('property_type') || '');
  const status = formData.get('published') ? 'PUBLISHED' : 'DRAFT';

  if (!title) return { error: 'Title is required' };
  if (!city) return { error: 'City is required' };
  if (price === null || price < 0) return { error: 'Price must be >= 0' };

  const { data, error } = await supabase
    .from('listings')
    .insert({
      agent_id: agentId,
      title,
      description: String(formData.get('description') || ''),
      purpose: purpose as 'BUY' | 'RENT',
      property_type,
      price,
      currency: String(formData.get('currency') || 'EUR'),
      city,
      address: String(formData.get('address') || ''),
      bedrooms: toInt(formData.get('bedrooms')),
      bathrooms: toInt(formData.get('bathrooms')),
      area_sqm: toNumber(formData.get('area_sqm')),
      lat: toNumber(formData.get('lat')),
      lng: toNumber(formData.get('lng')),
      featured: formData.get('featured') === 'on',
      status,
      published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath('/dashboard/listings');
  return { success: true, id: data.id };
}

export async function updateListingAction(_: any, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Not authenticated' };

  const supabase = await createServerSupabaseClient();
  const id = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim();
  const city = String(formData.get('city') || '').trim();
  const price = toInt(formData.get('price'));
  const purpose = String(formData.get('purpose') || '');
  const property_type = String(formData.get('property_type') || '');
  const status = formData.get('published') ? 'PUBLISHED' : 'DRAFT';

  if (!id) return { error: 'Missing id' };
  if (!title) return { error: 'Title is required' };
  if (!city) return { error: 'City is required' };
  if (price === null || price < 0) return { error: 'Price must be >= 0' };

  const { error } = await supabase
    .from('listings')
    .update({
      title,
      description: String(formData.get('description') || ''),
      purpose: purpose as 'BUY' | 'RENT',
      property_type,
      price,
      currency: String(formData.get('currency') || 'EUR'),
      city,
      address: String(formData.get('address') || ''),
      bedrooms: toInt(formData.get('bedrooms')),
      bathrooms: toInt(formData.get('bathrooms')),
      area_sqm: toNumber(formData.get('area_sqm')),
      lat: toNumber(formData.get('lat')),
      lng: toNumber(formData.get('lng')),
      featured: formData.get('featured') === 'on',
      status,
      published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/listings');
  revalidatePath(`/dashboard/listings/${id}/edit`);
  return { success: true };
}

export async function deleteListingAction(_: any, formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return { error: 'Missing id' };
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/listings');
  return { success: true };
}

export async function setPublishedAction(_: any, formData: FormData) {
  const id = String(formData.get('id') || '');
  const published = formData.get('published') === 'true';
  if (!id) return { error: 'Missing id' };
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from('listings')
    .update({ status: published ? 'PUBLISHED' : 'DRAFT', published_at: published ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/listings');
  revalidatePath(`/dashboard/listings/${id}/edit`);
  return { success: true };
}
