'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { unbookGift } from '../actions/unbookGift';

type UnbookButtonProps = {
  id: string;
};

export function UnbookButton({ id }: UnbookButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUnbook = () => {
    setError(null);

    startTransition(async () => {
      const result = await unbookGift(id);

      // On success the action revalidates the page, so the item re-renders as available.
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleUnbook}
        disabled={isPending}
        size="sm"
        className="bg-navy text-white rounded-full font-secondary text-xs cursor-pointer"
        aria-label="Cancel booking"
      >
        <X />
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </>
  );
}
