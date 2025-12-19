import { requireRole } from '../authz';
import { createPublicSupabaseClient } from '../supabase/public';
import { createServerSupabaseClient } from '../supabase/server';
import type { BlogPostRow } from '../../types/db';

export async function getPublishedPosts() {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, published_at')
    .eq('status', 'PUBLISHED')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Pick<BlogPostRow, 'id' | 'title' | 'slug' | 'excerpt' | 'cover_image_url' | 'published_at'>[];
}

export async function getPublishedPostBySlug(slug: string) {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content_md, cover_image_url, published_at')
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .not('published_at', 'is', null)
    .maybeSingle();

  if (error || !data) return null;
  return data as Pick<
    BlogPostRow,
    'id' | 'title' | 'slug' | 'excerpt' | 'content_md' | 'cover_image_url' | 'published_at'
  >;
}

type AdminListParams = {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export async function getAllPostsForAdmin({ q, status, page = 1, pageSize = 20 }: AdminListParams) {
  await requireRole(['ADMIN'], { redirectTo: '/dashboard' });
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, status, published_at, updated_at', { count: 'exact' })
    .order('updated_at', { ascending: false });

  if (q) {
    query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  if (status && status !== 'ALL') {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const totalCount = count ?? 0;
  return {
    data: (data ?? []) as Pick<BlogPostRow, 'id' | 'title' | 'slug' | 'status' | 'published_at' | 'updated_at'>[],
    count: totalCount,
    page,
    pageSize,
    totalPages: totalCount ? Math.ceil(totalCount / pageSize) : 0,
  };
}

export async function getPostByIdForAdmin(id: string) {
  await requireRole(['ADMIN'], { redirectTo: '/dashboard' });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as BlogPostRow;
}
