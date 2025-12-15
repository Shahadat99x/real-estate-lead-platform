import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blog | Real Estate Trends & Tips',
    description: 'Latest insights, market trends, and tips for buyers and sellers.',
    openGraph: {
        title: 'Blog | Real Estate Trends & Tips',
        description: 'Latest insights, market trends, and tips for buyers and sellers.',
    },
};

export default async function BlogIndexPage() {
    const { posts } = await getBlogPosts({ status: 'published', limit: 20 });

    return (
        <div className="container py-12 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Our Blog</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Insights, market analysis, and tips to help you navigate the real estate world.
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No posts published yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Card key={post.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
                            {/* Image placeholder or actual image */}
                            {post.cover_image_url ? (
                                <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
                                    {/* Use standard img for now or next/image if configured. Using img to be safe with external URLs */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                                    <span className="text-muted-foreground font-semibold">No Cover Image</span>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="line-clamp-2 leading-tight">
                                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                                        {post.title}
                                    </Link>
                                </CardTitle>
                                <div className="flex items-center text-sm text-muted-foreground pt-1">
                                    <CalendarIcon className="mr-2 h-3 w-3" />
                                    {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Unpublished'}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground text-sm line-clamp-3">
                                    {post.excerpt || 'No excerpt available.'}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/blog/${post.slug}`}>
                                        Read More
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
