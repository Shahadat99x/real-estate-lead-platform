'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '../../components/ui/badge';
import type { ProfilesRow } from '../../types/db';

const navItems = [
  { href: '/dashboard', label: 'Overview', roles: ['ADMIN', 'AGENT'] as const },
  { href: '/dashboard/listings', label: 'Listings', roles: ['ADMIN', 'AGENT'] as const },
  { href: '/dashboard/leads', label: 'Leads', roles: ['ADMIN', 'AGENT'] as const },
  { href: '/dashboard/admin/blog', label: 'Blog', roles: ['ADMIN'] as const },
  { href: '/dashboard/admin', label: 'Admin', roles: ['ADMIN'] as const },
];

type Props = { profile: ProfilesRow; children: React.ReactNode };

export default function DashboardShell({ profile, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const filteredNav = navItems.filter((item) => item.roles.includes(profile.role));

  const SidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      <div className="px-5 py-4 border-b border-slate-200">
        <p className="text-lg font-semibold text-slate-900">Real Estate</p>
        <p className="text-xs text-slate-500">Dashboard</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block rounded-lg px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-brand-50 text-brand-700 border border-brand-100'
                  : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-200 text-sm text-slate-700 space-y-1">
        <p className="font-semibold truncate">{profile.email ?? 'Unknown user'}</p>
        <Badge>{profile.role}</Badge>
        <Link href="/logout" className="text-brand-700 font-medium text-sm hover:underline">
          Logout
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 shrink-0">{SidebarContent}</aside>

        {/* Mobile sidebar (slide over) */}
        <div
          className={clsx(
            'fixed inset-0 z-40 md:hidden transition-opacity duration-200',
            open ? 'bg-slate-900/50 visible opacity-100' : 'invisible opacity-0'
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-slate-200 transform transition-transform duration-200 md:hidden',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {SidebarContent}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
              >
                <span className="sr-only">Open navigation</span>
                <div className="space-y-1">
                  <span className="block h-0.5 w-5 bg-slate-700"></span>
                  <span className="block h-0.5 w-5 bg-slate-700"></span>
                  <span className="block h-0.5 w-5 bg-slate-700"></span>
                </div>
              </button>
              <div>
                <p className="text-sm font-semibold text-slate-900">Real Estate</p>
                <p className="text-xs text-slate-500">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">{profile.email ?? profile.id}</p>
                <p className="text-xs text-slate-500">Signed in</p>
              </div>
              <Badge className="hidden sm:inline-flex">{profile.role}</Badge>
              <Link
                href="/logout"
                className="inline-flex items-center rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition"
              >
                Sign out
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
