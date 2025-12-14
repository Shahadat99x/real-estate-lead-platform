'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '../ui/button';

type PaginationProps = {
    page: number;
    totalPages: number;
    totalItems: number;
};

export function Pagination({ page, totalPages, totalItems }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    function goToPage(newPage: number) {
        if (newPage < 1 || newPage > totalPages) return;
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    }

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6">
            <div className="hidden sm:flex flex-1 items-center justify-between">
                <div>
                    <p className="text-sm text-slate-700">
                        Showing page <span className="font-medium">{page}</span> of{' '}
                        <span className="font-medium">{totalPages}</span> ({totalItems} results)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                        className="border border-slate-300"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages}
                        className="border border-slate-300"
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Mobile View */}
            <div className="flex flex-1 items-center justify-between sm:hidden">
                <Button
                    variant="ghost"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="text-sm"
                >
                    Previous
                </Button>
                <span className="text-sm font-medium text-slate-700">
                    {page} / {totalPages}
                </span>
                <Button
                    variant="ghost"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="text-sm"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
