import Link from 'next/link';
import { Card, CardBody, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Tools</h1>
        <p className="text-sm text-slate-600">Quick access to admin-only features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Blog Management */}
        <Card>
          <CardHeader title="Blog" subtitle="Manage blog posts and content" />
          <CardBody className="space-y-3">
            <p className="text-sm text-slate-600">
              Create, edit, and publish blog posts for the public site.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/admin/blog">Manage Blog</Link>
            </Button>
          </CardBody>
        </Card>

        {/* Listings Overview */}
        <Card>
          <CardHeader title="Listings" subtitle="Property management" />
          <CardBody className="space-y-3">
            <p className="text-sm text-slate-600">
              View and manage all property listings across agents.
            </p>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/dashboard/listings">View Listings</Link>
            </Button>
          </CardBody>
        </Card>

        {/* Leads Overview */}
        <Card>
          <CardHeader title="Leads" subtitle="Inquiries and contacts" />
          <CardBody className="space-y-3">
            <p className="text-sm text-slate-600">
              Manage customer inquiries and lead assignments.
            </p>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/dashboard/leads">View Leads</Link>
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Future Features Placeholder */}
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-sm text-slate-500">More admin modules coming soon...</p>
        </CardBody>
      </Card>
    </div>
  );
}
