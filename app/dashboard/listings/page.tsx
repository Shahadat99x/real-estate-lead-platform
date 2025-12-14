import Link from 'next/link';
import { getCurrentProfile, requireUser } from '../../../lib/authz';
import { getDashboardListings } from '../../../lib/queries/dashboard';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardBody } from '../../../components/ui/card';
import PublishToggle from '../../../components/dashboard/PublishToggle';
import { ListingsFilters } from '../../../components/dashboard/ListingsFilters';
import { Pagination } from '../../../components/dashboard/Pagination';
import { DeleteListingButton } from '../../../components/dashboard/DeleteListingButton';

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'PUBLISHED'
      ? 'bg-green-50 text-green-700 border-green-100'
      : status === 'DRAFT'
        ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
        : 'bg-slate-50 text-slate-700 border-slate-100';
  return <Badge className={color}>{status}</Badge>;
}

export default async function DashboardListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    purpose?: string;
    featured?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 20;

  const { data: listings, count, totalPages } = await getDashboardListings({
    profileId: profile.id,
    role: profile.role,
    q: params.q,
    status: params.status,
    purpose: params.purpose,
    featured: params.featured,
    sort: params.sort,
    page,
    pageSize,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Listings</h1>
          <p className="text-sm text-slate-600">Manage your property portfolio.</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/listings/new">New listing</Link>
        </Button>
      </div>

      <ListingsFilters role={profile.role} />

      <Card>
        <CardBody className="p-0">
          <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200 bg-slate-50/50">
            <span className="col-span-2">Title</span>
            <span>Location</span>
            <span>Price</span>
            <span>Purpose</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {listings.map((listing) => (
              <div key={listing.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                {/* Mobile View */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900 line-clamp-2">{listing.title}</p>
                      <p className="text-sm text-slate-600 mt-0.5">{listing.city}</p>
                    </div>
                    <StatusBadge status={listing.status} />
                  </div>

                  <div className="flex items-baseline justify-between">
                    <p className="text-lg font-medium text-slate-900">€{Intl.NumberFormat('en-US').format(listing.price)}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{listing.purpose}</Badge>
                      {listing.featured && <Badge className="bg-brand-50 text-brand-700 border-brand-100">Featured</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
                    <Link href={`/dashboard/listings/${listing.id}/media`} className="text-sm text-slate-600 hover:text-brand-700">
                      Media
                    </Link>
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="text-sm text-brand-700 font-medium">
                      Edit
                    </Link>
                    <DeleteListingButton id={listing.id} />
                    {/* PublishToggle triggers server action, kept as is */}
                    <div className="ml-2">
                      <PublishToggle id={listing.id} published={listing.status === 'PUBLISHED'} />
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:grid grid-cols-7 gap-4 items-center">
                  <div className="col-span-2">
                    <p className="font-medium text-slate-900 truncate" title={listing.title}>{listing.title}</p>
                    {/* Optional: Add ID or reference if needed, kept clean for now */}
                  </div>
                  <p className="text-sm text-slate-700 truncate">{listing.city}</p>
                  <p className="text-sm font-medium text-slate-900">€{Intl.NumberFormat('en-US').format(listing.price)}</p>
                  <div>
                    <Badge variant="outline" className="font-normal text-slate-600">{listing.purpose}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={listing.status} />
                    {listing.featured && <span className="flex h-2 w-2 rounded-full bg-brand-500" title="Featured" />}
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/dashboard/listings/${listing.id}/media`} className="text-sm text-slate-500 hover:text-slate-900" title="Manage Photos">
                      Photos
                    </Link>
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="text-sm text-brand-600 hover:text-brand-800 font-medium">
                      Edit
                    </Link>
                    <PublishToggle id={listing.id} published={listing.status === 'PUBLISHED'} />
                    <DeleteListingButton id={listing.id} />
                  </div>
                </div>
              </div>
            ))}
            {listings.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-500 bg-slate-50/30">
                <p>No listings found matching your criteria.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/dashboard/listings">Clear filters</Link>
                </Button>
              </div>
            )}
          </div>
        </CardBody>
        <Pagination page={page} totalPages={totalPages} totalItems={count} />
      </Card>
    </div>
  );
}
