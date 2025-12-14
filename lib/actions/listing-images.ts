'use server';

import { createServerSupabaseClient } from '../supabase/server';
import { requireUser } from '../authz';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addListingImageAction(prevState: any, formData: FormData) {
    await requireUser();
    const supabase = await createServerSupabaseClient();

    const listingId = formData.get('listingId') as string;
    const url = formData.get('url') as string;
    const publicId = formData.get('publicId') as string;
    const altText = formData.get('altText') as string;

    if (!listingId || !url) {
        return { error: 'Missing required image data' };
    }

    // RLS will enforce we can only insert if we own the listing
    const { error } = await supabase.from('listing_images').insert({
        listing_id: listingId,
        url,
        public_id: publicId,
        alt_text: altText,
        sort_order: 999, // Append to end, reorder handles details
    });

    if (error) {
        console.error('Add Image Error:', error);
        return { error: 'Failed to save image reference.' };
    }

    revalidatePath(`/dashboard/listings/${listingId}/media`);
    return { ok: true };
}

export async function deleteListingImageAction(prevState: any, formData: FormData) {
    await requireUser();
    const supabase = await createServerSupabaseClient();

    const imageId = formData.get('imageId') as string;
    const listingId = formData.get('listingId') as string;

    if (!imageId || !listingId) return { error: 'Missing ID' };

    const { error } = await supabase
        .from('listing_images')
        .delete()
        .eq('id', imageId);

    if (error) {
        console.error('Delete Image Error:', error);
        return { error: 'Failed to delete image.' };
    }

    revalidatePath(`/dashboard/listings/${listingId}/media`);
    return { ok: true };
}

export async function reorderListingImagesAction(listingId: string, orderedIds: string[]) {
    // Not form data, but direct call
    await requireUser();
    const supabase = await createServerSupabaseClient();

    // We loop and update. For small sets this is fine. 
    // RLS ensures we own the images.
    const updates = orderedIds.map((id, index) =>
        supabase
            .from('listing_images')
            .update({ sort_order: index })
            .eq('id', id)
            .eq('listing_id', listingId) // Safety check
    );

    await Promise.all(updates);

    revalidatePath(`/dashboard/listings/${listingId}/media`);
    return { ok: true };
}

export async function publishListingAction(prevState: any, formData: FormData) {
    await requireUser();
    const supabase = await createServerSupabaseClient();
    const listingId = formData.get('listingId') as string;

    const { error } = await supabase
        .from('listings')
        .update({
            status: 'PUBLISHED',
            published_at: new Date().toISOString()
        })
        .eq('id', listingId);

    if (error) {
        return { error: 'Failed to publish listing.' };
    }

    revalidatePath('/listings');
    revalidatePath(`/listings/${listingId}`);
    revalidatePath('/dashboard/listings');

    redirect('/dashboard/listings');
}
