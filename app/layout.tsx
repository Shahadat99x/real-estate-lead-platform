import './globals.css';
import '@uiw/react-md-editor/markdown-editor.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'EstateNova | Modern Real Estate Platform',
  description: 'Find your dream home with EstateNova.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo-icon.svg',
    shortcut: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: '#0F172A',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f6f8fb] text-slate-900">
        {children}
      </body>
    </html>
  );
}
