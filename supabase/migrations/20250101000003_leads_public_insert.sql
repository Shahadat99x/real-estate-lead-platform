-- Enable RLS on leads table if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public (anonymous) users to insert leads
-- This is critical for the public contact form to work without login
CREATE POLICY "leads_public_insert"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Ensure admins can view all leads (if policy doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'leads' 
        AND policyname = 'leads_admin_all'
    ) THEN
        CREATE POLICY "leads_admin_all"
        ON public.leads
        FOR ALL
        USING (public.is_admin());
    END IF;
END
$$;
