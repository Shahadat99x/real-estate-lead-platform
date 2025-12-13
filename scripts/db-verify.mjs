/**
 * Prints verification SQL to validate schema + RLS in Supabase SQL Editor.
 * No network calls are made; copy/paste the output into the Dashboard.
 */

const queries = [
  {
    title: 'Tables present',
    sql: `
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
`.trim(),
  },
  {
    title: 'Policies per table',
    sql: `
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
`.trim(),
  },
  {
    title: 'Published listings visible to anon (RLS)',
    sql: `
reset all;
set local role anon;
set local "request.jwt.claim.sub" = null;
select id, title, status, published_at from public.listings;
`.trim(),
  },
  {
    title: 'Agent can see own draft listings and leads',
    sql: `
-- replace with an existing agent UUID
reset all;
set local role authenticated;
set local "request.jwt.claim.sub" = '<agent_uuid>';
select id, title, status from public.listings;
select l.id, l.listing_id, l.email from public.leads l;
`.trim(),
  },
  {
    title: 'Admin override',
    sql: `
-- replace with an admin UUID
reset all;
set local role authenticated;
set local "request.jwt.claim.sub" = '<admin_uuid>';
select count(*) from public.leads;
`.trim(),
  },
];

console.log('Verification queries (paste each block into Supabase SQL Editor):\n');
queries.forEach(({ title, sql }, idx) => {
  console.log(`${idx + 1}. ${title}\n${sql}\n`);
});

console.log('Profile trigger smoke test:');
console.log(`
-- 1) Create a throwaway user (service role context in SQL editor):
insert into auth.users (id, email) values (gen_random_uuid(), 'cli-test@example.com');

-- 2) Confirm profile auto-created:
select id, email, role, created_at from public.profiles where email = 'cli-test@example.com';

-- 3) Cleanup:
delete from auth.users where email = 'cli-test@example.com';
`);
