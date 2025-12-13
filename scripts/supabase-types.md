# Supabase type generation

Run with Supabase CLI (requires `SUPABASE_ACCESS_TOKEN` + project ref):
```bash
supabase gen types typescript --project-ref your-ref --schema public > types/db.ts
```

If the CLI is unavailable (e.g., portfolio/demo), keep `types/db.ts` hand-edited in sync with the database schema and rerun the command above whenever the schema changes.
