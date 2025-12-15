-- 1. Check Public Access (should only return 'published')
-- Switch to anon role logic (simulated by just querying with specific where clause or checking policies)
-- In Supabase SQL Editor:
-- SELECT * FROM blog_posts; -- As Postgres role, shows all.

-- To test policies, you can use:
-- SELECT * FROM blog_posts WHERE status = 'published';

-- 2. Insert Test Data
INSERT INTO blog_posts (title, slug, content, status, published_at)
VALUES 
('Draft Post', 'draft-post', 'This is a draft.', 'draft', null),
('Published Post', 'published-post', 'This is public.', 'published', now())
ON CONFLICT (slug) DO NOTHING;

-- 3. Verify Admin Access (Assuming you are logged in as Admin in dashboard)
-- Go to /dashboard/admin/blog -> Should see both posts.

-- 4. Verify Public Access
-- Go to /blog -> Should see only "Published Post".
-- Go to /blog/draft-post -> Should 404.
-- Go to /blog/published-post -> Should 200.

-- 5. Cleanup
-- DELETE FROM blog_posts WHERE slug IN ('draft-post', 'published-post');
