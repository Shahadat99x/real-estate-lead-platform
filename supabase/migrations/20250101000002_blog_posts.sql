-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text,
  content text NOT NULL,
  cover_image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id),
  CONSTRAINT blog_posts_slug_key UNIQUE (slug)
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published posts
CREATE POLICY "Public can view published posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- Policy: Admins can do everything
-- Assumes profile.role is available via a hypothetical auth.email() check or custom claim.
-- Since previous migrations/authz.ts imply a "profiles" table and role based auth,
-- we'll rely on a joined check or similar mechanism if possible, 
-- BUT robust RLS often needs a helper function or claims.
-- Based on the user's prompt "App runs ... Supabase schema ... in supabase/migrations",
-- I'll use a common pattern: check generic authenticated access for now, 
-- or better, check the profiles table if exists.
-- Let's look at what the user said: "ADMIN can CRUD all".
-- I'll use a policy that checks the `profiles` table for the current user's role.

CREATE POLICY "Admins can do everything"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Agents can view published posts (same as public, but explicit for authenticated users if needed)
-- Actually, the public policy applies to anon. Authenticated users (Agents) also need read access.
-- If the public policy is "TO public", it covers everyone including authenticated unless we restrict it.
-- Supabase "public" role includes everyone. So "Public can view published posts" covers Agents.
-- However, we explicitly need to ensure Agents CANNOT CRUD.
-- The "Admins can do everything" covers CRUD for admins.
-- An "Agents read only" policy for non-published? No, Agent cannot read drafts.
-- So Agents are effectively same as public for this table.
-- Just in case, I will add an explicit read policy for authenticated users for published posts 
-- to be safe if `public` role is restricted in project settings (less common).
CREATE POLICY "Authenticated can view published posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
