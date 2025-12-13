'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { signIn } from './actions';

type State = { error?: string; success?: boolean };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 text-white py-2.5 font-medium hover:bg-brand-700 transition disabled:opacity-70"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}

export default function LoginForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction] = useFormState<State, FormData>(signIn, {});

  useEffect(() => {
    if (state?.success) {
      // Redirect client-side as a fallback; server action already redirects.
      redirect('/dashboard');
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={initialEmail}
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-slate-700">Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
