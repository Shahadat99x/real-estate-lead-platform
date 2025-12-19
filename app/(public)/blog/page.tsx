import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardBody, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { getPublishedPosts } from '../../../lib/queries/blog';

export const metadata: Metadata = {
  title: 'Blog | Real Estate Lead Platform',
  description: 'Insights on real estate marketing, lead generation, and property trends.',
  openGraph: {
    title: 'Blog | Real Estate Lead Platform',
    description: 'Insights on real estate marketing, lead generation, and property trends.',
  },
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="bg-[#f6f8fb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-brand-600">Blog</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Ideas, tactics, and market insights</h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
            Learn how modern teams capture quality real estate leads, showcase listings beautifully, and move faster.
          </p>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12 text-slate-600">
              No posts published yet. Check back soon.
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const publishedLabel = formatDate(post.published_at);
              return (
                <Card key={post.id} className="h-full overflow-hidden border-slate-200 shadow-sm">
                  <div className="aspect-[4/2.3] bg-gradient-to-br from-brand-50 to-slate-100">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">
                        No cover image
                      </div>
                    )}
                  </div>
                  <CardHeader
                    title={
                      <Link href={`/blog/${post.slug}`} className="text-lg font-semibold text-slate-900 hover:text-brand-700">
                        {post.title}
                      </Link>
                    }
                    subtitle={publishedLabel ?? 'Recently updated'}
                    className="pb-2"
                  />
                  <CardBody className="flex flex-col gap-4 text-sm text-slate-600">
                    <p className="line-clamp-3 leading-relaxed">{post.excerpt || 'Stay tuned for more details soon.'}</p>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/blog/${post.slug}`}>Read article</Link>
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
