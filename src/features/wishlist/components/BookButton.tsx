'use client';

import { useState, useTransition } from 'react';
import { Gift } from 'lucide-react';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { bookGift } from '../actions/bookGift';

type BookButtonProps = {
  id: string;
  version: number;
  status: WishlistItem['status'];
};

export function BookButton({ id, version, status }: BookButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === 'booked') {
    return (
      <Button disabled variant="secondary" size="sm">
        <Gift className="h-4 w-4" />
        Already booked
      </Button>
    );
  }

  const handleBook = () => {
    setError(null);

    startTransition(async () => {
      // The server action uses the version for an optimistic concurrency check.
      const result = await bookGift(id, version);

      // On success the action revalidates the page, so the fresh data
      // re-renders this item as booked; only failures need handling here.
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleBook}
        disabled={isPending}
        variant="secondary"
        className="cursor-pointer"
        size="sm"
      >
        <Gift className="h-4 w-4" />
        {isPending ? 'Booking...' : 'Book'}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </>
  );
}
