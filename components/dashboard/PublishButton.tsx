'use client';

import { useActionState } from 'react';
import { Button } from '../ui/button';
import { publishListingAction } from '../../lib/actions/listing-images';

export function PublishButton({ listingId }: { listingId: string }) {
    const [state, formAction] = useActionState(publishListingAction, { error: '' });

    return (
        <form action={formAction}>
            <input type="hidden" name="listingId" value={listingId} />
            <Button type="submit" variant="primary" disabled={false}>
                Publish Listing
            </Button>
            {state?.error && (
                <p className="text-sm text-red-600 mt-2">{state.error}</p>
            )}
        </form>
    );
}
