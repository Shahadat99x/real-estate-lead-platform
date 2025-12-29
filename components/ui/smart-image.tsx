import Image from 'next/image';

const ALLOWED_IMAGE_HOSTS = [
    'picsum.photos',
    'images.unsplash.com',
    'plus.unsplash.com',
    'lh3.googleusercontent.com',
    'xsggames.co',
    'res.cloudinary.com',
];

function isAllowedHost(url: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        return ALLOWED_IMAGE_HOSTS.includes(hostname);
    } catch {
        return false;
    }
}

type SmartImageProps = {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    className?: string;
    sizes?: string;
    width?: number;
    height?: number;
};

/**
 * SmartImage component that uses next/image for allowed hosts
 * and falls back to regular img tag for external URLs
 */
export function SmartImage({ src, alt, fill, priority, className, sizes, width, height }: SmartImageProps) {
    const useNextImage = isAllowedHost(src);

    if (useNextImage) {
        return (
            <Image
                src={src}
                alt={alt}
                fill={fill}
                priority={priority}
                className={className}
                sizes={sizes}
                width={width}
                height={height}
            />
        );
    }

    // Fallback to regular img for external URLs
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={priority ? 'eager' : 'lazy'}
            style={fill ? { objectFit: 'cover', width: '100%', height: '100%' } : undefined}
            width={width}
            height={height}
        />
    );
}
