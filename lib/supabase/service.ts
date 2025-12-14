import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/db';

/**
 * Service role Supabase client that bypasses RLS.
 * Use ONLY in server actions/route handlers, never expose to client.
 * This is necessary for operations where RLS policies may not cover the use case.
 */
export function createServiceRoleClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
