import Link from 'next/link';
import { ListingForm } from '../../../../components/dashboard/ListingForm';
import { getCurrentProfile, requireUser } from '../../../../lib/authz';
import { ensureAgent } from '../../../../lib/queries/dashboard';

export default async function NewListingPage() {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) return null;
  await ensureAgent(profile.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">New listing</h1>
          <p className="text-sm text-slate-600">Add property details and publish when ready.</p>
        </div>
        <Link href="/dashboard/listings" className="text-sm text-brand-700 font-semibold hover:underline">
          Back to listings
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <ListingForm />
      </div>
    </div>
  );
}
