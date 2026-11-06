'use client';

import { useState, useTransition } from 'react';
import { signIn, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bookGift } from '../actions/bookGift';
import { announceGiftBooked } from '../utils/giftBookedEvent';
import { HandGiftIcon } from './HandIcons';
import { stickerIconButtonClass, stickerInk, type StickerLook } from './Sticker';

type BookButtonProps = {
  id: string;
  version: number;
  // Die-cut sticker colours for the gift icon.
  sticker: StickerLook;
};

// Icon-only Book button for an available gift's card.
export function BookButton({ id, version, sticker }: BookButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = session?.user?.email;

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
        size="icon"
        className={cn(stickerIconButtonClass, 'hover:-rotate-6')}
        style={stickerInk(sticker)}
        aria-label={isPending ? 'Booking...' : 'Book'}
      >
        <HandGiftIcon className="size-10" sticker={sticker.paper} />
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </>
  );
}
