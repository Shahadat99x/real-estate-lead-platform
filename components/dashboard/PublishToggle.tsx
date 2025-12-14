'use client';

import { useTransition } from 'react';
import { Button } from '../ui/button';
import { setPublishedAction } from '../../lib/actions/listings';

export default function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(formData) => startTransition(() => setPublishedAction(null, formData))}
      className="inline-flex"
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="published" value={published ? 'false' : 'true'} />
      <Button type="submit" variant="ghost" className="text-sm px-3" disabled={pending}>
        {published ? 'Unpublish' : 'Publish'}
      </Button>
    </form>
  );
}
