import Link from 'next/link';
import { Card, CardBody, CardHeader } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { createPostAction } from '../../../../../lib/actions/blog';
import { PostForm } from '../_components/PostForm';

export default function NewBlogPostPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">New blog post</h1>
          <p className="text-sm text-slate-600">Draft a post. You can publish after saving.</p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/admin/blog" className="text-sm">
            Back to blog
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader title="Post details" subtitle="Title, slug, preview, and Markdown content." />
        <CardBody>
          <PostForm action={createPostAction} submitLabel="Create draft" />
        </CardBody>
      </Card>
    </div>
  );
}
