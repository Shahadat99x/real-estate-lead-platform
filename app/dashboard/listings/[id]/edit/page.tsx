import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ListingForm } from '../../../../../components/dashboard/ListingForm';
import { getCurrentProfile, requireUser } from '../../../../../lib/authz';
import { getListingForEdit } from '../../../../../lib/queries/dashboard';

export default async function EditListingPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const listing = await getListingForEdit(id, profile.id, profile.role) as any;
  if (!listing) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Edit listing</h1>
          <p className="text-sm text-slate-600">{listing.title}</p>
        </div>
        <Link href="/dashboard/listings" className="text-sm text-brand-700 font-semibold hover:underline">
          Back to listings
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <ListingForm listing={listing as any} role={profile.role} />
      </div>
    </div>
  );
}
