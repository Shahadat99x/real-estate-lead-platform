'use client';

import Link from 'next/link';
import { useState } from 'react';
import clsx from 'clsx';

export default function MobileNav({ links, ctaHref, ctaLabel }: { links: { href: string; label: string }[]; ctaHref: string; ctaLabel: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Open menu"
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
        onClick={() => setOpen(true)}
      >
        <div className="space-y-1">
          <span className="block h-0.5 w-5 bg-slate-700"></span>
          <span className="block h-0.5 w-5 bg-slate-700"></span>
          <span className="block h-0.5 w-5 bg-slate-700"></span>
        </div>
      </button>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-slate-900/50 transition-opacity',
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={clsx(
          'fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg border-l border-slate-200 transform transition-transform',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-brand-700">Menu</span>
            <button className="text-slate-500 text-sm" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href={ctaHref}
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 text-white py-2 text-sm font-semibold hover:bg-brand-700 transition"
          >
            {ctaLabel}
          </Link>
        </div>
      </aside>
    </>
  );
}
