import { Card, CardBody } from '../ui/card';
import type { AgentsRow } from '../../types/db';

export function AgentCard({ agent }: { agent: AgentsRow }) {
  return (
    <Card className="h-full">
      <CardBody className="space-y-2">
        <p className="text-lg font-semibold text-slate-900">{agent.display_name}</p>
        <p className="text-sm text-slate-600 line-clamp-3">{agent.bio ?? 'Experienced agent.'}</p>
        <p className="text-xs text-slate-500">{agent.service_areas?.join(', ')}</p>
      </CardBody>
    </Card>
  );
}
