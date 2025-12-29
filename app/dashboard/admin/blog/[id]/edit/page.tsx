import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '../../../../../../components/ui/badge';
import { Button } from '../../../../../../components/ui/button';
import { Card, CardBody, CardHeader } from '../../../../../../components/ui/card';
import { deletePostAction, setPostPublishedAction, updatePostAction } from '../../../../../../lib/actions/blog';
import { getPostByIdForAdmin } from '../../../../../../lib/queries/blog';
import { PostForm } from '../../_components/PostForm';

export default async function EditBlogPostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const post = await getPostByIdForAdmin(id);
  if (!post) return notFound();

  const isPublished = post.status === 'PUBLISHED';
  const redirectTo = `/dashboard/admin/blog/${post.id}/edit`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">Editing post</p>
          <h1 className="text-2xl font-semibold text-slate-900">{post.title}</h1>
          <div className="flex items-center gap-2">
            <Badge className={isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>
              {post.status}
            </Badge>
            {isPublished && post.published_at && (
              <span className="text-xs text-slate-500">
                Published {new Date(post.published_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && (
            <Button variant="secondary" asChild>
              <Link href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                Public URL
              </Link>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/dashboard/admin/blog" className="text-sm">
              Back to blog
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Post details" subtitle="Update title, slug, excerpt, and Markdown content." />
            <CardBody>
              <PostForm action={updatePostAction} initialData={post} submitLabel="Save changes" />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Publishing" subtitle="Control visibility of this post." />
            <CardBody className="space-y-3">
              <form action={setPostPublishedAction as any} className="space-y-2">
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="publish" value={isPublished ? 'false' : 'true'} />
                <Button type="submit" variant={isPublished ? 'outline' : 'primary'} className="w-full">
                  {isPublished ? 'Unpublish' : 'Publish'}
                </Button>
              </form>
              <p className="text-xs text-slate-500">
                Published posts appear on the public blog when they have a publish date.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Danger zone" subtitle="Delete removes the post permanently." />
            <CardBody className="space-y-2">
              <form action={deletePostAction as any} className="space-y-2">
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="redirectTo" value="/dashboard/admin/blog" />
                <Button type="submit" variant="destructive" className="w-full">
                  Delete post
                </Button>
              </form>
              <p className="text-xs text-slate-500">This cannot be undone.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
