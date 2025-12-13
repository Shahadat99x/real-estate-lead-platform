import { Card, CardBody, CardHeader } from '../../../components/ui/card';
import { TableCard } from '../../../components/ui/table-card';

export default function LeadsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Leads</h1>
      <Card>
        <CardHeader title="Lead inbox" subtitle="Coming soon: review inbound leads" />
        <CardBody>
          <p className="text-sm text-slate-600">Placeholder content for leads.</p>
        </CardBody>
      </Card>
      <TableCard title="Recent leads" subtitle="Scrollable on small screens">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Listing</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="py-2 pr-4 text-slate-800">Sample lead</td>
              <td className="py-2 pr-4 text-slate-700">lead@example.com</td>
              <td className="py-2 pr-4 text-slate-700">Sample listing</td>
            </tr>
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
