'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPost, updatePost, deletePost } from '@/app/actions/blog';
import type { BlogPost } from '@/lib/blog';
import { Loader2, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface PostFormProps {
    post?: BlogPost;
    isNew?: boolean;
}

export function PostForm({ post, isNew = false }: PostFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');

    // Auto-generate slug from title if it's new and slug hasn't been manually touched (simple heuristic)
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (isNew && !slug) { // Only auto-fill if empty? Or always if new? Let's do always if "new" and user hasn't typed in slug manually. 
            // Simplified: just auto-slugify. User can edit slug later.
            setSlug(slugify(newTitle));
        }
    };

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')  // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        // Append the controlled status properly if not in form
        // Actually, we can just use a hidden input or the name attribute on Select if implemented correctly.
        // But Select in shadcn/ui usually needs a hidden input or controlled state.
        formData.set('status', status);

        try {
            if (isNew) {
                await createPost(formData);
            } else if (post) {
                await updatePost(post.id, formData);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!post || !confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
        setIsDeleting(true);
        try {
            await deletePost(post.id);
            router.push('/dashboard/admin/blog');
        } catch (err) {
            console.error(err);
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/admin/blog">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{isNew ? 'New Post' : 'Edit Post'}</h1>
                </div>
                <div className="flex items-center space-x-2">
                    {!isNew && (
                        <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isSubmitting || isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting || isDeleting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isNew ? 'Create Post' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={title}
                                    onChange={handleTitleChange}
                                    required
                                    placeholder="Enter post title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                    placeholder="post-url-slug"
                                />
                                <p className="text-xs text-muted-foreground">Unique identifier for the URL.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    name="excerpt"
                                    defaultValue={post?.excerpt || ''}
                                    placeholder="Brief summary for list views and SEO"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content (Markdown)</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    defaultValue={post?.content || ''}
                                    required
                                    placeholder="Write your post content here... (Markdown supported)"
                                    className="font-mono text-sm min-h-[400px]"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {!isNew && post && (
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {post.published_at && <p>Published: {new Date(post.published_at).toLocaleDateString()}</p>}
                                    <p>Created: {new Date(post.created_at).toLocaleDateString()}</p>
                                    <p>Updated: {new Date(post.updated_at).toLocaleDateString()}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Media</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                                <Input
                                    id="cover_image_url"
                                    name="cover_image_url"
                                    defaultValue={post?.cover_image_url || ''}
                                    placeholder="https://..."
                                />
                                <p className="text-xs text-muted-foreground">URL to the cover image.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
