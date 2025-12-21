import { getCurrentProfile } from '../../lib/authz';
import { Card, CardBody, CardHeader } from '../../components/ui/card';
import { getDashboardOverview } from '../../lib/queries/dashboard';
import Link from 'next/link';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'PUBLISHED'
      ? 'bg-green-50 text-green-700 border-green-100'
      : status === 'DRAFT'
        ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
        : 'bg-slate-50 text-slate-700 border-slate-100';
  return <Badge className={color}>{status}</Badge>;
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null; // Should be handled by middleware/layout usually, but safe guard.

  const { counts, recentLeads, recentListings } = await getDashboardOverview(profile.id, profile.role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">
          Track listings and manage incoming inquiries.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-500">Active Listings</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-slate-900">{counts.activeListings}</p>
              <span className="text-sm text-slate-500">/ {counts.totalListings} total</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-500">New Leads</p>
            <p className="text-3xl font-semibold text-brand-600 mt-2">{counts.newLeads}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-500">Leads (7d)</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">{counts.leads7d}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-slate-500">Published Rate</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">
              {counts.publishedRate !== null ? `${counts.publishedRate}%` : '—'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Leads */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Leads</h2>
            <Link href="/dashboard/leads" className="text-sm text-brand-600 hover:text-brand-800 font-medium">
              View all
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-slate-100">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <Link href={`/dashboard/leads`} className="block">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900">{lead.name}</p>
                          <p className="text-sm text-slate-500 truncate mt-0.5">
                            {lead.listings?.title ? `Inquiry: ${lead.listings.title}` : 'General Inquiry'}
                          </p>
                        </div>
                        <Badge className="bg-white border-slate-200 text-slate-600 border font-normal">
                          {lead.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No new leads yet.</p>
                  <Button variant="outline" asChild className="mt-4">
                    <Link href="/dashboard/listings">Promote Listings</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recently Updated</h2>
            <Link href="/dashboard/listings" className="text-sm text-brand-600 hover:text-brand-800 font-medium">
              Manage listings
            </Link>
          </div>
          <Card>
            <div className="divide-y divide-slate-100">
              {recentListings.length > 0 ? (
                recentListings.map((listing) => (
                  <div key={listing.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <Link href={`/dashboard/listings/${listing.id}/edit`} className="block">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1 mr-4">
                          <p className="font-medium text-slate-900 truncate">{listing.title}</p>
                          <p className="text-sm text-slate-500 truncate mt-0.5">{listing.city}</p>
                        </div>
                        <StatusBadge status={listing.status} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-semibold text-slate-700">
                          €{Intl.NumberFormat('en-US').format(listing.price)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Updated {new Date(listing.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No listings created yet.</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/listings/new">Create Listing</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Dev only session info */}
      {process.env.NODE_ENV !== 'production' && (
        <Card className="opacity-50 hover:opacity-100 transition-opacity">
          <CardHeader title="Session (Dev Only)" />
          <CardBody className="space-y-2 text-sm text-slate-700">
            <p>ID: {profile.id}</p>
            <p>Role: {profile.role}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
