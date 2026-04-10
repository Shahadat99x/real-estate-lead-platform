import Link from 'next/link';
import { ListingWizardInfoForm } from '../../../../components/dashboard/ListingWizardInfoForm';
import { requireRole } from '../../../../lib/authz';
import { ensureListingOwnerRecord } from '../../../../lib/queries/dashboard';

export default async function NewListingPage() {
  await requireRole(['ADMIN']);

  // Ensure the listing owner record exists before showing the form.
  await ensureListingOwnerRecord();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Create new listing</h1>
          <p className="text-sm text-slate-600">Step 1: Property details</p>
        </div>
        <Link href="/dashboard/listings" className="text-sm text-brand-700 font-semibold hover:underline">
          Cancel
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <ListingWizardInfoForm />
      </div>
    </div>
  );
}
