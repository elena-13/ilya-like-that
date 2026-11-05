'use client';

import { useState, useTransition } from 'react';
import { signIn, useSession } from 'next-auth/react';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { bookGift } from '../actions/bookGift';
import { announceGiftBooked } from '../utils/giftBookedEvent';
import { HandGiftIcon, handInk } from './HandIcons';
import { stickerInk, type StickerLook } from './Sticker';
import { cn } from '@/lib/utils';

// Icon-only button; with a sticker the icon gets a die-cut outline.
const iconButton =
  'relative size-10 bg-transparent hover:bg-transparent dark:hover:bg-transparent hover:-rotate-6 hover:scale-110';

type BookButtonProps = {
  id: string;
  version: number;
  status: WishlistItem['status'];
  bookedBy?: WishlistItem['bookedBy'];
  // Die-cut sticker colours; without it the icon is plain red.
  sticker?: StickerLook;
};

export function BookButton({ id, version, status, bookedBy, sticker }: BookButtonProps) {
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
        className={cn(iconButton, !sticker && handInk)}
        style={sticker && stickerInk(sticker)}
        aria-label={isMine ? 'Your booking' : 'Already booked'}
      >
        <HandGiftIcon className="size-10" sticker={sticker?.paper} />
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
        className={cn(iconButton, !sticker && handInk, 'cursor-pointer')}
        style={sticker && stickerInk(sticker)}
        size="icon"
        aria-label={isPending ? 'Booking...' : 'Book'}
      >
        <HandGiftIcon className="size-10" sticker={sticker?.paper} />
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </>
  );
}
