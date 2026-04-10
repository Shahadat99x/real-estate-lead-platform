import { redirect } from 'next/navigation';
import { getCurrentProfile } from '../../lib/authz';
import { syncConfiguredAdminRole } from '../../lib/superadmin';
import { getUser } from '../../lib/supabase/server';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const user = await getUser();
  if (user) {
    await syncConfiguredAdminRole(user.id, user.email);

    const profile = await getCurrentProfile();
    if (profile?.role === 'ADMIN') {
      redirect('/dashboard');
    }
    redirect('/logout?next=/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-100 p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Superadmin sign in</h1>
          <p className="text-sm text-slate-600">Only the owner account can access the dashboard right now.</p>
        </div>
        <LoginForm initialEmail="" />
      </div>
    </div>
  );
}
