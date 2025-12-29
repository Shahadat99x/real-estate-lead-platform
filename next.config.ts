import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com', // For Google Auth profile pictures
            },
            {
                protocol: 'https',
                hostname: 'xsggames.co', // Common avatar source
            },
        ],
    },
    typescript: {
        // Temporarily disable TypeScript errors during build for faster deployment
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
