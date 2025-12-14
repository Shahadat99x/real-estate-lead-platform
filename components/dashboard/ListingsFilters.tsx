'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useDebounce } from 'use-debounce'; // If available, otherwise manual debounce or simple effect
// Assuming no use-debounce installed, I'll use a simple useEffect debounce or just onBlur/Enter for search to keep it simple and performant.

type ListingsFiltersProps = {
    role: 'ADMIN' | 'AGENT';
};

export function ListingsFilters({ role }: ListingsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Local state for immediate UI feedback
    const [q, setQ] = useState(searchParams.get('q') || '');
    const [params, setParams] = useState({
        status: searchParams.get('status') || 'ALL',
        purpose: searchParams.get('purpose') || 'ALL',
        featured: searchParams.get('featured') || 'ALL',
        sort: searchParams.get('sort') || 'newest',
    });

    // Debounced Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (q !== (searchParams.get('q') || '')) {
                handleFilterChange('q', q);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [q]);

    function handleFilterChange(key: string, value: string) {
        const newParams = new URLSearchParams(searchParams);
        if (value && value !== 'ALL') {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        // Reset page on filter change
        newParams.set('page', '1');

        startTransition(() => {
            router.push(`?${newParams.toString()}`);
            router.refresh();
        });
    }

    // Sync local state when URL changes (e.g. back button)
    useEffect(() => {
        setQ(searchParams.get('q') || '');
        setParams({
            status: searchParams.get('status') || 'ALL',
            purpose: searchParams.get('purpose') || 'ALL',
            featured: searchParams.get('featured') || 'ALL',
            sort: searchParams.get('sort') || 'newest',
        });
    }, [searchParams]);

    const handleChange = (key: string, value: string) => {
        setParams(prev => ({ ...prev, [key]: value }));
        handleFilterChange(key, value);
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Search</label>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by title or city..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                        <select
                            value={params.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Purpose</label>
                        <select
                            value={params.purpose}
                            onChange={(e) => handleChange('purpose', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                            <option value="ALL">All Types</option>
                            <option value="BUY">For Sale</option>
                            <option value="RENT">For Rent</option>
                        </select>
                    </div>

                    {role === 'ADMIN' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Featured</label>
                            <select
                                value={params.featured}
                                onChange={(e) => handleChange('featured', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                            >
                                <option value="ALL">All</option>
                                <option value="YES">Featured</option>
                                <option value="NO">Not Featured</option>
                            </select>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Sort By</label>
                        <select
                            value={params.sort}
                            onChange={(e) => handleChange('sort', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="pt-2 flex justify-end">
                <Button
                    variant="ghost"
                    onClick={() => {
                        setQ('');
                        setParams({ status: 'ALL', purpose: 'ALL', featured: 'ALL', sort: 'newest' });
                        router.push('?');
                        router.refresh();
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900"
                >
                    Clear Filters
                </Button>
            </div>
        </div>
    );
}
