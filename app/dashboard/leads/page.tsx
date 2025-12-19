import { getCurrentProfile, requireUser } from '../../../lib/authz';
import { getDashboardLeads } from '../../../lib/queries/dashboard';
import { LeadsFilters } from '../../../components/dashboard/LeadsFilters';
import { LeadsInbox } from '../../../components/dashboard/LeadsInbox';
import { Pagination } from '../../../components/dashboard/Pagination';

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    listing?: string;
  }>;
}) {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 20;

  const { data: leads, count, totalPages } = await getDashboardLeads({
    profileId: profile.id,
    role: profile.role,
    q: params.q,
    status: params.status,
    listingId: params.listing,
    page,
    pageSize,
  });

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex-none space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Leads Inbox</h1>
          <p className="text-sm text-slate-600">Manage inquiries from your listings.</p>
        </div>
        <LeadsFilters />
      </div>

      <div className="flex-1 min-h-0">
        <LeadsInbox leads={leads} />
      </div>

      <div className="flex-none">
        <Pagination
          basePath="/dashboard/leads"
          page={page}
          totalPages={totalPages}
          totalItems={count}
          query={{ q: params.q, status: params.status, listing: params.listing }}
        />
      </div>
    </div>
  );
}
