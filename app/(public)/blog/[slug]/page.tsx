import Image from 'next/image';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Button } from '../../../../components/ui/button';
import { Card, CardBody } from '../../../../components/ui/card';
import { getPublishedPostBySlug } from '../../../../lib/queries/blog';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: 'Post not found' };
  }

  const description = post.excerpt || 'Read insights from our real estate team.';

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.published_at || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const publishedLabel = formatDate(post.published_at);

  return (
    <div className="bg-[#f6f8fb] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" asChild className="px-0 text-slate-700 hover:text-brand-700">
            <Link href="/blog">&larr; Back to blog</Link>
          </Button>
          {publishedLabel && <p className="text-sm text-slate-500">Published {publishedLabel}</p>}
        </div>

        {post.cover_image_url && (
          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative aspect-video">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-semibold text-brand-600">Blog</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-slate-600">{post.excerpt}</p>}
        </div>

        <Card>
          <CardBody>
            <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {post.content_md}
              </ReactMarkdown>
            </article>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
