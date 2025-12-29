'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/button';

export default function MobileNav({ links, ctaHref, ctaLabel }: { links: { href: string; label: string }[]; ctaHref: string; ctaLabel: string }) {
    const [open, setOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Lock body scroll and handle focus/ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        if (open) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
            // Focus internal close button or first link after animation
            setTimeout(() => {
                const firstFocusable = navRef.current?.querySelector('button, a') as HTMLElement;
                firstFocusable?.focus();
            }, 100);
        } else {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    return (
        <>
            <button
                ref={triggerRef}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu-drawer"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(true)}
            >
                <div className="space-y-1.5" aria-hidden="true">
                    <span className="block h-0.5 w-6 bg-slate-800 rounded-full"></span>
                    <span className="block h-0.5 w-6 bg-slate-800 rounded-full"></span>
                    <span className="block h-0.5 w-6 bg-slate-800 rounded-full"></span>
                </div>
            </button>

            {/* Backdrop */}
            <div
                aria-hidden="true"
                className={clsx(
                    'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-all duration-300',
                    open ? 'opacity-100 visible' : 'opacity-0 invisible'
                )}
                onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <aside
                id="mobile-menu-drawer"
                ref={navRef}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
                className={clsx(
                    'fixed inset-y-0 right-0 z-50 w-[80%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <span className="text-xl font-bold text-slate-900">Menu</span>
                        <button
                            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                            onClick={() => setOpen(false)}
                            aria-label="Close menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-5 space-y-2">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center justify-between w-full p-3 text-lg font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-brand-700 transition-all border border-transparent hover:border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                                <span className="text-slate-300" aria-hidden="true">›</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4">
                        <Button
                            asChild
                            className="w-full text-base font-semibold h-12 shadow-md bg-slate-900 text-white hover:bg-brand-700 transition-all"
                        >
                            <Link href={ctaHref} onClick={() => setOpen(false)}>
                                {ctaLabel}
                            </Link>
                        </Button>
                        <p className="text-xs text-center text-slate-400 font-medium">
                            © 2024 EstateNova Inc.
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
