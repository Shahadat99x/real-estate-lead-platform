import { ReactNode } from 'react';
import { requireRole } from '../../lib/authz';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(['ADMIN']);
  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
