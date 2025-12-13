import { getCurrentProfile } from '../../lib/authz';
import { Card, CardBody, CardHeader } from '../../components/ui/card';

const stats = [
  { label: 'Active listings', value: '—' },
  { label: 'Leads this week', value: '—' },
  { label: 'Published rate', value: '—' },
];

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">
          {profile?.role === 'ADMIN'
            ? 'Full visibility across agents and leads.'
            : 'Your listings and leads at a glance.'}
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Session" subtitle="Debug info for environment health" />
        <CardBody className="space-y-2 text-sm text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500">User ID</span>
            <span className="font-medium">{profile?.id ?? 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium">{profile?.email ?? 'n/a'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-semibold">{profile?.role ?? 'n/a'}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
