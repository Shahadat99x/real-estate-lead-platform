import { ReactNode } from 'react';
import { getCurrentProfile, requireUser } from '../../lib/authz';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const profile = await getCurrentProfile();
  
  // If profile is missing, show a clear error state instead of silent null
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Account Error</h1>
          <p className="text-slate-600 mb-4">
            Your account exists but is missing required profile data. This may be a temporary issue or your account may need to be re-provisioned.
          </p>
          <p className="text-sm text-slate-500">
            Please contact support or try logging out and back in.
          </p>
          <a
            href="/logout"
            className="inline-block mt-6 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Sign Out
          </a>
        </div>
      </div>
    );
  }

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
