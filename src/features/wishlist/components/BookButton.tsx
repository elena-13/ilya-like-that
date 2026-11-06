'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { bookGift } from '../actions/bookGift';
import type { BookingErrorCode } from '../actions/errors';
import {
  announceGiftBooked,
  announceGiftBookingFailed,
  getBurstOrigin,
} from '../utils/giftBookedEvent';
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
  const [error, setError] = useState<BookingErrorCode | null>(null);
  const t = useTranslations('wishlist');
  const tErrors = useTranslations('errors');

  const currentUserEmail = session?.user?.email;

  const handleBook = (event: MouseEvent<HTMLButtonElement>) => {
    // Guests have to sign in before booking; send them to Google and bring them back here.
    if (!currentUserEmail) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    setError(null);
    // Celebrate right away instead of after the server round-trip.
    announceGiftBooked(getBurstOrigin(event.currentTarget));

    startTransition(async () => {
      // The server action uses the version for an optimistic concurrency check.
      const result = await bookGift(id, version);

      if (!result.success) {
        announceGiftBookingFailed();
        setError(result.error);
      }
      // On success the action revalidates the page, which re-renders this item as booked.
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
        aria-label={isPending ? t('booking') : t('book')}
      >
        <HandGiftIcon className="size-10" sticker={sticker.paper} />
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-500">
          {tErrors(error)}
        </p>
      )}
    </>
  );
}
