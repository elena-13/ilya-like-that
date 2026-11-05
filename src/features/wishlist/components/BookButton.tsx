'use client';

import { useState, useTransition } from 'react';
import { signIn, useSession } from 'next-auth/react';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { bookGift } from '../actions/bookGift';
import { announceGiftBooked } from '../utils/giftBookedEvent';
import { HandGiftIcon, handInk } from './HandIcons';
import { cn } from '@/lib/utils';

// Just the red icon: no fill, no border.
const iconButton = 'relative size-10 rounded-full bg-transparent hover:bg-background dark:hover:bg-background hover:text-[#b83c2b] hover:-rotate-6';

type BookButtonProps = {
  id: string;
  version: number;
  status: WishlistItem['status'];
  bookedBy?: WishlistItem['bookedBy'];
};

export function BookButton({ id, version, status, bookedBy }: BookButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = session?.user?.email;

  if (status === 'booked') {
    const isMine = Boolean(currentUserEmail) && currentUserEmail === bookedBy;

    return (
      <Button
        disabled
        variant="ghost"
        size="icon"
        className={cn(iconButton, handInk)}
        aria-label={isMine ? 'Your booking' : 'Already booked'}
      >
        <HandGiftIcon className="size-6" />
      </Button>
    );
  }

  const handleBook = () => {
    // Guests have to sign in before booking; send them to Google and bring them back here.
    if (!currentUserEmail) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    setError(null);

    startTransition(async () => {
      // The server action uses the version for an optimistic concurrency check.
      const result = await bookGift(id, version);

      if (!result.success) {
        setError(result.error);
        return;
      }

      // The action revalidates the page, which re-renders this item as booked.
      announceGiftBooked();
    });
  };

  return (
    <>
      <Button
        onClick={handleBook}
        disabled={isPending || sessionStatus === 'loading'}
        variant="ghost"
        className={cn(iconButton, handInk, 'cursor-pointer')}
        size="icon"
        aria-label={isPending ? 'Booking...' : 'Book'}
      >
        <HandGiftIcon className="size-6" />
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </>
  );
}
