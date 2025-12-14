'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '../supabase/server';
import { requireUser } from '../authz';
import { getOrCreateAgentForCurrentUser } from '../queries/dashboard';

export async function createListingDraftAction(prevState: any, formData: FormData) {
    const user = await requireUser();
    const agentId = await getOrCreateAgentForCurrentUser(user.id);

    const supabase = await createServerSupabaseClient();

    // Extract fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = Number(formData.get('price'));
    const purpose = formData.get('purpose') as 'BUY' | 'RENT';
    const property_type = formData.get('property_type') as string;
    const city = formData.get('city') as string;
    const address = formData.get('address') as string;
    const bedrooms = Number(formData.get('bedrooms'));
    const bathrooms = Number(formData.get('bathrooms'));
    const area_sqm = Number(formData.get('area_sqm'));

    // Validate required
    if (!title || !price || !city) {
        return { error: 'Please fill in all required fields.' };
    }

    const { data: listing, error } = await supabase
        .from('listings')
        .insert({
            agent_id: agentId,
            title,
            description,
            price,
            purpose,
            property_type,
            city,
            address,
            bedrooms,
            bathrooms,
            area_sqm,
            status: 'DRAFT',
            published_at: null,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Create Listing Error:', error);
        return { error: 'Failed to create listing.' };
    }

    // Redirect to Step 2 (Media)
    redirect(`/dashboard/listings/${listing.id}/media`);
}
