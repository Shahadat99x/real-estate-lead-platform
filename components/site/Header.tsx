"use client";

import Link from 'next/link';
import Image from 'next/image';
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
  const ctaLabel = 'Get in Touch';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm'
        : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-80">
            <Image
              src="/logo.svg"
              alt="EstateNova"
              width={140}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <MobileNav links={links} ctaHref={ctaHref} ctaLabel={ctaLabel} />
          <div className="hidden md:block">
            <Button
              asChild
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg transition-all rounded-lg px-5"
            >
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
