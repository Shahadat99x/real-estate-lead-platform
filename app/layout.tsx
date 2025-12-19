import './globals.css';
import '@uiw/react-md-editor/markdown-editor.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Real Estate Dashboard',
  description: 'Manage listings and leads',
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  themeColor: '#1e66ff',
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
