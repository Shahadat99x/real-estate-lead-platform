'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
  const [state, formAction] = useActionState(createLead, {});

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center space-y-2 animate-in fade-in duration-300">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
          ✅
        </div>
        <h3 className="text-lg font-semibold text-green-800">Inquiry Sent!</h3>
        <p className="text-sm text-green-700">
          Thanks for reaching out. We will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="listing_id" value={listingId} />
      {/* Honeypot field - must be hidden and empty */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name <span className="text-red-500">*</span></label>
          <input
            id="name"
            name="name"
            required
            placeholder="John Doe"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email <span className="text-red-500">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message <span className="text-red-500">*</span></label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          defaultValue="I am interested in this property and would like to schedule a viewing. Please contact me."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow resize-none"
        />
      </div>

      {state.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-start gap-2">
          <span>⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      <SubmitButton />
      <p className="text-xs text-slate-400 text-center">
        By sending, you agree to our Terms of Service.
      </p>
    </form>
  );
}
