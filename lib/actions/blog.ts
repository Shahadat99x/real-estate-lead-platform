"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '../authz';
import { createServerSupabaseClient } from '../supabase/server';

type ActionState = { error?: string; message?: string };

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function createPostAction(_prevState: ActionState, formData: FormData) {
  const profile = await requireRole(['ADMIN'], { redirectTo: '/dashboard' });
  const supabase = await createServerSupabaseClient();

  const title = String(formData.get('title') || '').trim();
  const rawSlug = String(formData.get('slug') || '').trim();
  const slug = normalizeSlug(rawSlug || title);
  const excerpt = String(formData.get('excerpt') || '').trim();
  const content_md = String(formData.get('content_md') || '').trim();
  const cover_image_url = String(formData.get('cover_image_url') || '').trim();
  const intent = String(formData.get('intent') || 'draft');
  const isPublish = intent === 'publish';

  if (!title) return { error: 'Title is required' };
  if (!slug) return { error: 'Slug is required' };
  if (!content_md) return { error: 'Content is required' };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title,
      slug,
      excerpt: excerpt || null,
      content_md,
      cover_image_url: cover_image_url || null,
      status: isPublish ? 'PUBLISHED' : 'DRAFT',
      published_at: isPublish ? new Date().toISOString() : null,
      author_id: profile.id,
    })
    .select('id, slug')
    .single();

  if (error || !data) {
    return { error: error?.message || 'Failed to create post' };
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath('/dashboard/admin/blog');
  redirect(`/dashboard/admin/blog/${data.id}/edit`);
}

export async function updatePostAction(_prevState: ActionState, formData: FormData) {
  await requireRole(['ADMIN'], { redirectTo: '/dashboard' });
  const supabase = await createServerSupabaseClient();

  const id = String(formData.get('id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const rawSlug = String(formData.get('slug') || '').trim();
  const slug = normalizeSlug(rawSlug || title);
  const excerpt = String(formData.get('excerpt') || '').trim();
  const content_md = String(formData.get('content_md') || '').trim();
  const cover_image_url = String(formData.get('cover_image_url') || '').trim();

  if (!id) return { error: 'Missing post id' };
  if (!title) return { error: 'Title is required' };
  if (!slug) return { error: 'Slug is required' };
  if (!content_md) return { error: 'Content is required' };

  const { data: existing, error: existingError } = await supabase
    .from('blog_posts')
    .select('slug, status, published_at')
    .eq('id', id)
    .maybeSingle();

  if (existingError || !existing) {
    return { error: 'Post not found' };
  }

  const nextPublishedAt =
    existing.status === 'PUBLISHED' ? existing.published_at ?? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content_md,
      cover_image_url: cover_image_url || null,
      published_at: nextPublishedAt,
    })
    .eq('id', id)
    .select('slug, status')
    .single();

  if (error || !data) {
    return { error: error?.message || 'Failed to update post' };
  }

  revalidatePath('/dashboard/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath(`/blog/${data.slug}`);

  return { message: 'Saved' };
}

export async function setPostPublishedAction(formData: FormData) {
  await requireRole(['ADMIN'], { redirectTo: '/dashboard' });
  const supabase = await createServerSupabaseClient();

  const id = String(formData.get('id') || '').trim();
  const publish = String(formData.get('publish') || '').toLowerCase() === 'true';
  const redirectTo = String(formData.get('redirectTo') || '/dashboard/admin/blog');

  if (!id) return { error: 'Missing post id' };

  const { data: existing, error: fetchError } = await supabase
    .from('blog_posts')
    .select('slug, status, published_at')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: 'Post not found' };
  }

  const status = publish ? 'PUBLISHED' : 'DRAFT';
  const published_at = publish ? existing.published_at ?? new Date().toISOString() : null;

  const { error } = await supabase
    .from('blog_posts')
    .update({ status, published_at })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${existing.slug}`);
  redirect(redirectTo);
}

export async function deletePostAction(formData: FormData) {
  await requireRole(['ADMIN'], { redirectTo: '/dashboard' });
  const supabase = await createServerSupabaseClient();

  const id = String(formData.get('id') || '').trim();
  const redirectTo = String(formData.get('redirectTo') || '/dashboard/admin/blog');
  if (!id) return { error: 'Missing post id' };

  const { data: existing } = await supabase.from('blog_posts').select('slug').eq('id', id).maybeSingle();

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/blog');
  revalidatePath('/blog');
  if (existing?.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }

  redirect(redirectTo);
}
