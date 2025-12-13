"use server";

import { createServerSupabaseClient } from '../supabase/server';

export type LeadInput = {
  listing_id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createLead(_: any, formData: FormData) {
  const listing_id = String(formData.get('listing_id') || '');
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!listing_id || !name || !email || !message) {
    return { error: 'All required fields must be filled.' };
  }
  if (!emailRegex.test(email)) {
    return { error: 'Please provide a valid email.' };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('leads').insert({
    listing_id,
    name,
    email,
    phone: phone || null,
    message,
    source: 'web',
  });

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
