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

      <TableCard title="All posts" subtitle="Includes drafts and published posts">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Published</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Updated</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {posts.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                  No posts found. Create your first draft to get started.
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const isPublished = post.status === 'PUBLISHED';
                const publishedLabel = post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : '-';
                const updatedLabel = post.updated_at ? new Date(post.updated_at).toLocaleDateString() : '-';

                return (
                  <tr key={post.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-slate-900">{post.title}</p>
                        <p className="text-xs text-slate-500">/blog/{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={isPublished ? 'bg-green-50 text-green-700 border-green-200' : ''}>{post.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{publishedLabel}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{updatedLabel}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/admin/blog/${post.id}/edit`}>Edit</Link>
                        </Button>
                        <form action={setPostPublishedAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="publish" value={isPublished ? 'false' : 'true'} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <Button variant={isPublished ? 'ghost' : 'secondary'} size="sm" type="submit">
                            {isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                        </form>
                        <form action={deletePostAction}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <Button variant="destructive" size="sm" type="submit">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableCard>

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
