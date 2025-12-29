import { getPublishedPosts } from '../lib/queries/blog';
import { getListings } from '../lib/queries/listings';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Static routes
    const routes = [
        '',
        '/about',
        '/listings',
        '/blog',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Listings
    const listings = (await getListings({})) as any[];
    const listingRoutes = listings.map((listing) => ({
        url: `${baseUrl}/listings/${listing.id}`,
        lastModified: new Date(listing.updated_at || listing.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic Blog Posts
    const posts = await getPublishedPosts();
    const postRoutes = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.published_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...routes, ...listingRoutes, ...postRoutes];
}
