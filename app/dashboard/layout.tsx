import { ReactNode } from 'react';
import { getCurrentProfile, requireUser } from '../../lib/authz';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const profile = await getCurrentProfile();
  if (!profile) {
    return null;
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
