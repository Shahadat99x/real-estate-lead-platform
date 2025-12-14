#!/usr/bin/env node
// Apply RLS policies via Supabase Management API
import 'dotenv/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const SQL_POLICIES = `
-- Allow agents to update leads that belong to their listings
CREATE POLICY IF NOT EXISTS leads_owner_update
ON public.leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id
      AND l.agent_id = public.current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id
      AND l.agent_id = public.current_user_id()
  )
);

-- Allow agents to delete leads that belong to their listings
CREATE POLICY IF NOT EXISTS leads_owner_delete
ON public.leads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id
      AND l.agent_id = public.current_user_id()
  )
);
`;

async function applyPolicies() {
  console.log('Applying RLS policies using Supabase REST API...');
  console.log('URL:', SUPABASE_URL);

  // Use the postgrest endpoint to call a raw SQL function
  // Actually, we need to use the Supabase SQL endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: SQL_POLICIES }),
  });

  if (!response.ok) {
    console.log('RPC endpoint not available. Trying alternative approach...');

    // Try using the pg endpoint directly if available
    // This typically requires the postgres connection string
    console.log(`
=== MANUAL FIX REQUIRED ===

Please log into Supabase Dashboard and run this SQL:

1. Go to: https://supabase.com/dashboard/project/knntumbfshdmjadxobnx/sql
2. Login with your Supabase credentials
3. Paste and run the following SQL:

${SQL_POLICIES}

4. Click "Run" button

After running, the lead buttons will work!
    `);
    return;
  }

  const result = await response.json();
  console.log('Result:', result);
  console.log('Policies applied successfully!');
}

applyPolicies().catch(err => {
  console.error('Error:', err.message);
});
