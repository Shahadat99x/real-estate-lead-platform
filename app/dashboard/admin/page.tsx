import { Card, CardBody, CardHeader } from '../../../components/ui/card';

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Admin</h1>
      <Card>
        <CardHeader title="Admin tools" subtitle="Reserved for ADMIN users" />
        <CardBody>
          <p className="text-sm text-slate-600">Placeholder for admin-only controls.</p>
        </CardBody>
      </Card>
    </div>
  );
}
