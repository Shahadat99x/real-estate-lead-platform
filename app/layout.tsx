import './globals.css';
import '@uiw/react-md-editor/markdown-editor.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'EstateNova | Modern Real Estate Platform',
    template: '%s | EstateNova',
  },
  description: 'Find your dream home with EstateNova. Browse verified listings, read market insights, and connect with top agents.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'EstateNova',
    title: 'EstateNova | Modern Real Estate Platform',
    description: 'Find your dream home with EstateNova. Browse verified listings, read market insights, and connect with top agents.',
    images: [
      {
        url: '/og-image.jpg', // Only if exists, fallback will happen naturally if not specific
        width: 1200,
        height: 630,
        alt: 'EstateNova Real Estate',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EstateNova | Modern Real Estate Platform',
    description: 'Find your dream home with EstateNova.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: './',
  },
  icons: {
    icon: '/logo-icon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192.png',
  },
};

export const viewport = {
  themeColor: '#1e66ff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#f6f8fb] text-slate-900 ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
