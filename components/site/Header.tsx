"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import MobileNav from './MobileNav';

const links = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Listings' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
];

export default function Header() {
  const ctaHref = '/contact';
  const ctaLabel = 'Contact';

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-brand-700">
            RealEstate
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-700 font-medium">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <MobileNav links={links} ctaHref={ctaHref} ctaLabel={ctaLabel} />
          <div className="hidden md:block">
            <Button asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
