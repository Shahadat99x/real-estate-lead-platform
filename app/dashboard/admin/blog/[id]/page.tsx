import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/authz';
import { PostForm } from '../_components/post-form';
import type { BlogPost } from '@/lib/blog';

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
    await requireRole(['admin']);
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !post) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <PostForm post={post as BlogPost} />
        </div>
    );
}
