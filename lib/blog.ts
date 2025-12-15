import { createServerSupabaseClient } from './supabase/server';
import { notFound } from 'next/navigation';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type GetBlogPostsOptions = {
  status?: 'published' | 'draft' | 'all';
  limit?: number;
  page?: number;
};

export async function getBlogPosts({ status = 'published', limit = 10, page = 1 }: GetBlogPostsOptions = {}) {
  const supabase = await createServerSupabaseClient();
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }

  return {
    posts: data as BlogPost[],
    count: count ?? 0,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    // If specifically not found, we can return null to let caller handle 404
    // or just return null here
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching blog post by slug:', error);
    throw new Error('Failed to fetch blog post');
  }

  return data as BlogPost;
}
