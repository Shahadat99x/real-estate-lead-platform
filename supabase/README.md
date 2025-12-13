# Supabase database workflow

## Install Supabase CLI
```bash
npm install -g supabase
```

## Link to your project
```bash
supabase login                          # or run `npm run db:login`
supabase link --project-ref $SUPABASE_PROJECT_REF   # or `npm run db:link`
```

## Apply migrations to the linked project
```bash
supabase db push    # or `npm run db:push`
```

## Verify schema/RLS quickly
1) Open Supabase Dashboard → SQL Editor.
2) Paste the verification queries printed by `node scripts/db-verify.mjs`.
3) Run them to confirm tables, policies, and the profile trigger behavior.

Notes:
- The initial migration is in `supabase/migrations/0001_init.sql`.
- Keep `SUPABASE_PROJECT_REF` in `.env.local` (template in `.env.example`).
