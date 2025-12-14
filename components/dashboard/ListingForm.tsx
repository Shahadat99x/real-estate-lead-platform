'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import type { ListingsRow, Role } from '../../types/db';
import { createListingAction, updateListingAction, deleteListingAction, setPublishedAction } from '../../lib/actions/listings';

type FormListing = Partial<ListingsRow> & { id?: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : label}
    </Button>
  );
}

export function ListingForm({ listing, role }: { listing?: FormListing; role: Role }) {
  const router = useRouter();
  const initialAction = listing?.id ? updateListingAction : createListingAction;
  const [state, formAction] = useActionState(initialAction, { ok: false });
  const published = listing?.status === 'PUBLISHED';

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state?.ok, state?.redirectTo, router]);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        {listing?.id && <input type="hidden" name="id" value={listing.id} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Title</label>
            <input
              name="title"
              defaultValue={listing?.title || ''}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">City</label>
            <input
              name="city"
              defaultValue={listing?.city || ''}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-600">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={listing?.description || ''}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Purpose</label>
            <select
              name="purpose"
              defaultValue={listing?.purpose || 'BUY'}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="BUY">Buy</option>
              <option value="RENT">Rent</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Property type</label>
            <select
              name="property_type"
              defaultValue={listing?.property_type || 'APARTMENT'}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="STUDIO">Studio</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="VILLA">Villa</option>
              <option value="LAND">Land</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Publish now</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="published" defaultChecked={published} />
              <span className="text-sm text-slate-700">{published ? 'Published' : 'Draft'}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Price (€)</label>
            <input
              name="price"
              type="number"
              min="0"
              required
              defaultValue={listing?.price ?? 0}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Currency</label>
            <input
              name="currency"
              defaultValue={listing?.currency || 'EUR'}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Bedrooms</label>
            <input
              name="bedrooms"
              type="number"
              min="0"
              defaultValue={listing?.bedrooms ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Bathrooms</label>
            <input
              name="bathrooms"
              type="number"
              min="0"
              defaultValue={listing?.bathrooms ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Area (sqm)</label>
            <input
              name="area_sqm"
              type="number"
              min="0"
              step="0.1"
              defaultValue={listing?.area_sqm ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Lat</label>
            <input
              name="lat"
              type="number"
              step="0.000001"
              defaultValue={listing?.lat ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Lng</label>
            <input
              name="lng"
              type="number"
              step="0.000001"
              defaultValue={listing?.lng ?? ''}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-600">Address</label>
          <input
            name="address"
            defaultValue={listing?.address || ''}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        {role === 'ADMIN' && (
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Featured (admin)</label>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="featured" defaultChecked={listing?.featured ?? false} />
              <span className="text-sm text-slate-700">Mark as featured</span>
            </div>
          </div>
        )}

        {state?.message && !state.ok && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.message}</p>
        )}
        {state?.ok && state?.message && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{state.message}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <SubmitButton label="Save" />
        </div>
      </form>

      {listing?.id && (
        <div className="flex flex-wrap gap-3">
          <form
            action={deleteListingAction}
            onSubmit={(e) => {
              if (!confirm('Delete this listing?')) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={listing.id} />
            <Button type="submit" variant="ghost" className="text-red-600 border-red-200 hover:bg-red-50">
              Delete
            </Button>
          </form>
          <form action={setPublishedAction}>
            <input type="hidden" name="id" value={listing.id} />
            <input type="hidden" name="published" value={published ? 'false' : 'true'} />
            <Button type="submit" variant="secondary">
              {published ? 'Unpublish' : 'Publish'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
