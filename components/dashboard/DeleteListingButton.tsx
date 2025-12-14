'use client';

import { useTransition } from 'react';
import { deleteListingAction } from '../../lib/actions/listings';
import { Button } from '../ui/button';

export function DeleteListingButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        if (confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
            const formData = new FormData();
            formData.append('id', id);
            startTransition(() => {
                deleteListingAction(null, formData);
            });
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm h-auto p-0"
        >
            {isPending ? 'Deleting...' : 'Delete'}
        </Button>
    );
}
