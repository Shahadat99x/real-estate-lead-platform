import Link from 'next/link';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardBody } from '../../../../components/ui/card';
import { TableCard } from '../../../../components/ui/table-card';
import { Pagination } from '../../../../components/dashboard/Pagination';
import { deletePostAction, setPostPublishedAction } from '../../../../lib/actions/blog';
import { getAllPostsForAdmin } from '../../../../lib/queries/blog';

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? '';
  const statusFilter = params.status ?? 'ALL';
  const page = Number(params.page) || 1;
  const pageSize = 15;

  const { data: posts, count, totalPages } = await getAllPostsForAdmin({
    q,
    status: statusFilter,
    page,
    pageSize,
  });

  const redirectTo = (() => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (statusFilter) next.set('status', statusFilter);
    next.set('page', page.toString());
    const qs = next.toString();
    return qs ? `/dashboard/admin/blog?${qs}` : '/dashboard/admin/blog';
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog posts</h1>
          <p className="text-sm text-slate-600">Draft, publish, and manage articles for the public site.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/blog/new">New post</Link>
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <form method="get" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              name="q"
              placeholder="Search by title or slug"
              defaultValue={q}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <div className="flex items-center sm:justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                Filter
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {/* Desktop Table Header */}
          <div className="hidden lg:grid grid-cols-6 gap-4 px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200 bg-slate-50">
            <span className="col-span-2">Title</span>
            <span>Status</span>
            <span>Published</span>
            <span>Updated</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Posts List */}
          <div className="divide-y divide-slate-100">
            {posts.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500 bg-slate-50/30">
                <p>No posts found. Create your first draft to get started.</p>
              </div>
            ) : (
              posts.map((post) => {
                const isPublished = post.status === 'PUBLISHED';
                const publishedLabel = post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : '-';
                const updatedLabel = post.updated_at ? new Date(post.updated_at).toLocaleDateString() : '-';

                return (
                  <div key={post.id} className="px-4 py-4 hover:bg-slate-50/50 transition-colors">
                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 line-clamp-2">{post.title}</p>
                          <p className="text-xs text-slate-500 mt-1">/blog/{post.slug}</p>
                        </div>
                        <Badge className={isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                          {post.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Published: {publishedLabel}</span>
                        <span>Updated: {updatedLabel}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={`/dashboard/admin/blog/${post.id}/edit`}>Edit</Link>
                        </Button>
                        <form action={setPostPublishedAction as any} className="flex-1">
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="publish" value={isPublished ? 'false' : 'true'} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <Button variant={isPublished ? 'ghost' : 'secondary'} size="sm" type="submit" className="w-full">
                            {isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                        </form>
                        <form action={deletePostAction as any}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <Button variant="destructive" size="sm" type="submit">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>

                    {/* Desktop Table Row */}
                    <div className="hidden lg:grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-2">
                        <p className="font-semibold text-slate-900 truncate" title={post.title}>{post.title}</p>
                        <p className="text-xs text-slate-500">/blog/{post.slug}</p>
                      </div>
                      <div>
                        <Badge className={isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                          {post.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-600">{publishedLabel}</span>
                      <span className="text-sm text-slate-600">{updatedLabel}</span>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/admin/blog/${post.id}/edit`}>Edit</Link>
                        </Button>
                        <form action={setPostPublishedAction as any} className="inline">
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="publish" value={isPublished ? 'false' : 'true'} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <Button variant={isPublished ? 'ghost' : 'secondary'} size="sm" type="submit">
                            {isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                        </form>
                        <form action={deletePostAction as any} className="inline">
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <Button variant="destructive" size="sm" type="submit">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardBody>
      </Card>

      <Pagination
        basePath="/dashboard/admin/blog"
        page={page}
        totalPages={totalPages}
        totalItems={count}
        query={{ q, status: statusFilter }}
      />
    </div>
  );
}
