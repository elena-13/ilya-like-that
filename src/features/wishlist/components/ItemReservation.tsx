'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { paths } from '@/lib/paths';
import { cardShadowClass } from '../styles';
import { HandCrossIcon, HandGiftIcon } from './HandIcons';
import { DEFAULT_STICKER, stickerPillClass, PillIcon, type StickerLook } from './Sticker';
import { bookGift } from '../actions/bookGift';
import { unbookGift } from '../actions/unbookGift';
import { announceGiftBooked } from '../utils/giftBookedEvent';

type ItemReservationProps = {
  id: string;
  version: number;
  status: WishlistItem['status'];
  bookedBy?: WishlistItem['bookedBy'];
  // Gift sticker colours, the same as this gift's Book icon on the list.
  sticker?: StickerLook;
};

/**
 * Status block + Book / Unbook controls for a single item.
 * Both server actions revalidate the page, so the fresh server-rendered state
 * replaces this component's props after a successful change.
 */
export default function ItemReservation({
  id,
  version,
  status,
  bookedBy,
  sticker = DEFAULT_STICKER,
}: ItemReservationProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = session?.user?.email;
  const isBooked = status === 'booked';
  const isBookedByCurrentUser =
    isBooked && Boolean(currentUserEmail) && bookedBy === currentUserEmail;

  const runAction = (action: () => ReturnType<typeof bookGift>, onSuccess?: () => void) => {
    setError(null);

    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess?.();
    });
  };

  const handleBook = () => {
    // Guests have to sign in before booking; send them to Google and bring them back here.
    if (!currentUserEmail) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    runAction(() => bookGift(id, version), announceGiftBooked);
  };

  const handleUnbook = () => runAction(() => unbookGift(id));

  const giftSticker = (
    <span style={{ color: sticker.ink }}>
      <HandGiftIcon className="size-9" sticker={sticker.paper} />
    </span>
  );

  return (
    <div className="space-y-8">
      {/* Status block: a small white card with the gift sticker */}
      <div
        className={cn('flex items-center gap-3 rounded-3xl bg-white p-4', cardShadowClass)}
        aria-label={isBooked ? 'Reserved' : 'Available'}
      >
        <span className="shrink-0">{giftSticker}</span>
        <div>
          <p className="font-secondary text-lg text-navy">{isBooked ? 'Reserved' : 'Available'}</p>
          <p className="text-sm text-navy/70">
            {!isBooked
              ? "This gift hasn't been reserved yet. Book it to let others know it's taken."
              : isBookedByCurrentUser
                ? 'You reserved this gift. No one else can book it while it stays reserved.'
                : 'Someone has already reserved this gift.'}
          </p>
        </div>
      </div>

      {/* Booking actions: outlined sticker pills in one row at the bottom
          right. My gifts is on every item page so people find the list of
          what they promised (otherwise it's only in the avatar menu); the
          main action for this gift sits last, next to it. */}
      <div className="flex flex-wrap justify-end gap-3">
        <Button asChild variant="outline" className={stickerPillClass}>
          <Link href={paths.myGifts()}>
            <PillIcon icon={HandGiftIcon} sticker={DEFAULT_STICKER} />
            My gifts
          </Link>
        </Button>

        {!isBooked && (
          <Button
            onClick={handleBook}
            disabled={isPending || sessionStatus === 'loading'}
            variant="outline"
            className={stickerPillClass}
          >
            <PillIcon icon={HandGiftIcon} sticker={sticker} />
            {isPending ? 'Booking…' : 'Book'}
          </Button>
        )}

        {isBookedByCurrentUser && (
          <Button
            onClick={handleUnbook}
            disabled={isPending}
            variant="outline"
            className={stickerPillClass}
          >
            <PillIcon icon={HandCrossIcon} sticker={sticker} />
            {isPending ? 'Cancelling…' : 'Cancel booking'}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-right text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
