import Link from 'next/link';
import { getCurrentProfile, requireUser } from '../../../lib/authz';
import { getDashboardListings } from '../../../lib/queries/dashboard';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardBody } from '../../../components/ui/card';
import { setPublishedAction } from '../../../lib/actions/listings';

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'PUBLISHED'
      ? 'bg-green-50 text-green-700 border-green-100'
      : status === 'DRAFT'
      ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
      : 'bg-slate-50 text-slate-700 border-slate-100';
  return <Badge className={color}>{status}</Badge>;
}

export default async function DashboardListingsPage() {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const listings = await getDashboardListings(profile.id, profile.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Listings</h1>
          <p className="text-sm text-slate-600">Create, publish, and edit your listings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new">New listing</Link>
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="hidden md:grid grid-cols-7 gap-2 px-4 py-3 text-xs font-semibold text-slate-500 border-b border-slate-200">
            <span className="col-span-2">Title</span>
            <span>City</span>
            <span>Price</span>
            <span>Purpose</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {listings.map((listing) => (
              <div key={listing.id} className="px-4 py-3">
                <div className="md:hidden space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-slate-900">{listing.title}</p>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="text-sm text-slate-600">{listing.city}</p>
                  <p className="text-sm text-slate-700">€{Intl.NumberFormat('en-US').format(listing.price)}</p>
                  <div className="flex items-center gap-2">
                    <Badge>{listing.purpose}</Badge>
                    {listing.featured && <Badge className="bg-brand-50 text-brand-700 border-brand-100">Featured</Badge>}
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="text-sm text-brand-700 font-semibold">
                      Edit
                    </Link>
                    <PublishToggle id={listing.id} published={listing.status === 'PUBLISHED'} />
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-7 gap-2 items-center">
                  <p className="col-span-2 font-semibold text-slate-900 truncate">{listing.title}</p>
                  <p className="text-sm text-slate-700">{listing.city}</p>
                  <p className="text-sm text-slate-700">€{Intl.NumberFormat('en-US').format(listing.price)}</p>
                  <Badge>{listing.purpose}</Badge>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={listing.status} />
                    {listing.featured && <Badge className="bg-brand-50 text-brand-700 border-brand-100">Featured</Badge>}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="text-sm text-brand-700 font-semibold">
                      Edit
                    </Link>
                    <PublishToggle id={listing.id} published={listing.status === 'PUBLISHED'} />
                  </div>
                </div>
              </div>
            ))}
            {listings.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-600">No listings yet. Create your first listing.</div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function PublishToggle({ id, published }: { id: string; published: boolean }) {
  return (
    <form action={setPublishedAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="published" value={published ? 'false' : 'true'} />
      <Button type="submit" variant="ghost" className="text-sm px-3">
        {published ? 'Unpublish' : 'Publish'}
      </Button>
    </form>
  );
}
