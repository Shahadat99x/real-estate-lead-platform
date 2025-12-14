'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { createListingDraftAction } from '../../lib/actions/listing-wizard';
import { Card, CardBody } from '../ui/card';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Create Draft & Continue' : 'Next: Upload Photos'}
        </Button>
    );
}

export function ListingWizardInfoForm() {
    const router = useRouter();
    const [state, formAction] = useActionState(createListingDraftAction, { error: '' });

    return (
        <Card>
            <CardBody>
                <form action={formAction} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-900">Basic Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Title</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="e.g. Modern Downtown Apartment"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">City</label>
                                <input
                                    name="city"
                                    required
                                    placeholder="e.g. Madrid"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Purpose</label>
                                <select
                                    name="purpose"
                                    defaultValue="BUY"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                >
                                    <option value="BUY">Buy</option>
                                    <option value="RENT">Rent</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <select
                                    name="property_type"
                                    defaultValue="APARTMENT"
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
                                <label className="text-sm font-medium text-slate-700">Price (€)</label>
                                <input
                                    name="price"
                                    type="number"
                                    min="0"
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold text-slate-900 pt-4">Property Specs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Bedrooms</label>
                                <input
                                    name="bedrooms"
                                    type="number"
                                    min="0"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Bathrooms</label>
                                <input
                                    name="bathrooms"
                                    type="number"
                                    min="0"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Area (sqm)</label>
                                <input
                                    name="area_sqm"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Address</label>
                            <input
                                name="address"
                                placeholder="Full address (optional)"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {state.error}
                        </p>
                    )}

                    <div className="flex justify-end pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
