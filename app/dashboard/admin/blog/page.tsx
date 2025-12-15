import { getBlogPosts } from '@/lib/blog';
import { requireRole } from '@/lib/authz';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, FileText, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils'; // Assuming this exists, if not I'll check or inline it

export default async function AdminBlogPage() {
    await requireRole(['admin']);

    const { posts } = await getBlogPosts({ status: 'all', limit: 100 });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
                    <p className="text-muted-foreground">
                        Manage your blog content and publications.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/admin/blog/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            <div className="border rounded-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Published At</th>
                                <th className="px-6 py-3">Created At</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No posts found. Create your first blog post!
                                    </td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className="bg-background hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-xs" title={post.title}>{post.title}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-xs">{post.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                {post.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {post.status === 'published' && (
                                                <Button variant="ghost" size="icon" asChild title="View Live">
                                                    <Link href={`/blog/${post.slug}`} target="_blank">
                                                        <Globe className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/admin/blog/${post.id}`}>
                                                    <Edit className="mr-2 h-3 w-3" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
