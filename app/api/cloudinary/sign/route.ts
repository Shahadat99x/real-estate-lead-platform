import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabaseClient } from '../../../../lib/supabase/server';
import { requireUser } from '../../../../lib/authz';

export async function POST(request: Request) {
    try {
        // Pass redirectTo: undefined to avoid 307 redirect, so we can return 401 JSON
        const user = await requireUser({ redirectTo: undefined });
        const body = await request.json();
        const { listingId } = body;

        if (!listingId) {
            return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();

        // Verify ownership/access via RLS
        // If we can select it, we have access (Owner or Admin)
        const { data: listing, error } = await supabase
            .from('listings')
            .select('id, agent_id')
            .eq('id', listingId)
            .single();

        if (error || !listing) {
            return NextResponse.json({ error: 'Permission denied or listing not found' }, { status: 403 });
        }

        // Cloudinary config
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const folder = process.env.CLOUDINARY_FOLDER || 'real-estate-demo';

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        // Generate signature
        const timestamp = Math.round(new Date().getTime() / 1000);

        // Parameters to sign (must be alphabetical)
        // folder, timestamp, ... and others if used
        // We are signing: folder, timestamp
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

        const signature = crypto
            .createHash('sha1')
            .update(paramsToSign + apiSecret)
            .digest('hex');

        return NextResponse.json({
            cloudName,
            apiKey,
            timestamp,
            signature,
            folder,
        });

    } catch (error: any) {
        if (error.message === 'Not authenticated') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.error('Cloudinary sign error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
