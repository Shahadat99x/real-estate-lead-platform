'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createLead } from '../../../../lib/actions/leads';
import { Button } from '../../../../components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Sending...' : 'Send inquiry'}
    </Button>
  );
}

export default function LeadForm({ listingId }: { listingId: string }) {
  const [state, formAction] = useFormState(createLead, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="listing_id" value={listingId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="name"
          required
          placeholder="Your name"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="phone"
          placeholder="Phone (optional)"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <textarea
        name="message"
        required
        rows={3}
        placeholder="I am interested in this property..."
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
      />

      {state?.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          Message sent! We will contact you shortly.
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
