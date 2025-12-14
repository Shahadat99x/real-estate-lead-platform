'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Button } from '../ui/button';
import { useDebounce } from 'use-debounce'; // Assuming installed, or use effect
import { useEffect } from 'react';

type LeadsFiltersProps = {
    // listings?: { id: string; title: string }[];
};

export function LeadsFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [q, setQ] = useState(searchParams.get('q') || '');
    const [status, setStatus] = useState(searchParams.get('status') || 'ALL');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (q !== (searchParams.get('q') || '')) {
                updateFilter('q', q);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [q]);

    function updateFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'ALL') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set('page', '1');
        startTransition(() => {
            router.push(`?${params.toString()}`);
            router.refresh();
        });
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Search</label>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, email..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
            <div className="w-full sm:w-48 space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        updateFilter('status', e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                    <option value="ALL">All Status</option>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="CLOSED">Closed</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>
            <div className="pt-5">
                <Button
                    variant="ghost"
                    onClick={() => {
                        setQ('');
                        setStatus('ALL');
                        router.push('?');
                    }}
                    className="text-xs text-slate-500"
                >
                    Clear
                </Button>
            </div>
        </div>
    );
}
