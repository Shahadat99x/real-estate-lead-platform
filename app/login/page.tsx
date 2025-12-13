import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { getUser } from '../../lib/supabase/server';
import { getCurrentProfile } from '../../lib/authz';

export default async function LoginPage() {
  const user = await getUser();
  if (user) {
    // Already signed in; send to dashboard.
    redirect('/dashboard');
  }

  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-100 p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-600">Sign in to manage your listings and leads.</p>
        </div>
        <LoginForm initialEmail={profile?.email ?? ''} />
      </div>
    </div>
  );
}
