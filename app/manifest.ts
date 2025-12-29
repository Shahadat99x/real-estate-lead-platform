import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'EstateNova',
        short_name: 'EstateNova',
        description: 'Modern real estate listings and lead management platform',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e66ff',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/icons/icon-maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    };
}
