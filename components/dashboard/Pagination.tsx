import Link from 'next/link';

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
  totalItems?: number;
};

export function Pagination({ basePath, page, totalPages, query, totalItems }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (pageNumber: number) => {
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, value);
    });
    params.set('page', pageNumber.toString());
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const baseButtonClass =
    'inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:pointer-events-none';

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6">
      <div className="hidden sm:flex flex-1 items-center justify-between">
        <div className="text-sm text-slate-700">
          Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
          {typeof totalItems === 'number' ? ` (${totalItems} results)` : null}
        </div>
        <div className="flex gap-2">
          {prevPage ? (
            <Link href={buildHref(prevPage)} className={baseButtonClass}>
              Previous
            </Link>
          ) : (
            <span className={`${baseButtonClass} pointer-events-none opacity-50`}>Previous</span>
          )}
          {nextPage ? (
            <Link href={buildHref(nextPage)} className={baseButtonClass}>
              Next
            </Link>
          ) : (
            <span className={`${baseButtonClass} pointer-events-none opacity-50`}>Next</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between sm:hidden">
        {prevPage ? (
          <Link href={buildHref(prevPage)} className="text-sm font-semibold text-slate-700">
            Previous
          </Link>
        ) : (
          <span className="text-sm text-slate-400">Previous</span>
        )}
        <span className="text-sm font-medium text-slate-700">
          {page} / {totalPages}
        </span>
        {nextPage ? (
          <Link href={buildHref(nextPage)} className="text-sm font-semibold text-slate-700">
            Next
          </Link>
        ) : (
          <span className="text-sm text-slate-400">Next</span>
        )}
      </div>
    </div>
  );
}
