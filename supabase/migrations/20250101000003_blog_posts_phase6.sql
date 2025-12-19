-- Phase 6: bring blog_posts schema + RLS to spec

-- 1) Rename legacy content column to content_md (or backfill then drop) to preserve data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'content'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'content_md'
    ) THEN
      ALTER TABLE public.blog_posts RENAME COLUMN content TO content_md;
    ELSE
      UPDATE public.blog_posts SET content_md = COALESCE(content_md, content);
      ALTER TABLE public.blog_posts DROP COLUMN content;
    END IF;
  END IF;
END $$;

-- 2) Schema adjustments
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS content_md text NOT NULL,
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Ensure constraints/defaults match spec
ALTER TABLE public.blog_posts ALTER COLUMN status SET DEFAULT 'DRAFT';
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
UPDATE public.blog_posts SET status = COALESCE(upper(status), 'DRAFT');
UPDATE public.blog_posts SET published_at = COALESCE(published_at, now()) WHERE status = 'PUBLISHED';
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_status_check CHECK (status IN ('DRAFT', 'PUBLISHED'));

-- Defensive not-null + timestamp defaults
ALTER TABLE public.blog_posts ALTER COLUMN content_md SET NOT NULL;
ALTER TABLE public.blog_posts ALTER COLUMN title SET NOT NULL;
ALTER TABLE public.blog_posts ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.blog_posts ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.blog_posts ALTER COLUMN updated_at SET DEFAULT now();

-- 3) Indexes
CREATE INDEX IF NOT EXISTS blog_posts_status_published_at_idx ON public.blog_posts (status, published_at DESC);

-- 4) updated_at trigger (ensure function exists, recreate trigger)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- 5) RLS policies
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can do everything" ON public.blog_posts;

-- Public (anon + authenticated) can only read published posts
CREATE POLICY "blog_posts_public_read_published"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'PUBLISHED' AND published_at IS NOT NULL);

-- Admins can manage everything
CREATE POLICY "blog_posts_admin_manage_all"
  ON public.blog_posts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
