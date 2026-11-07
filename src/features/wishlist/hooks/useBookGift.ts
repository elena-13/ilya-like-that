'use client';

import { useOptimistic, useState, useTransition, type MouseEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';

import type { WishlistItem } from '@/payload-types';
import { useRouter } from '@/i18n/navigation';
import { bookGift } from '../actions/bookGift';
import type { BookingErrorCode } from '../actions/errors';
import {
  announceGiftBooked,
  announceGiftBookingFailed,
  getBurstOrigin,
} from '../utils/giftBookedEvent';

type Booking = Pick<WishlistItem, 'status' | 'bookedBy'>;

/**
 * Booking for a wishlist card, shown optimistically: the card turns into
 * "your gift" the moment Book is tapped, together with the confetti, instead
 * of after the server round-trip.
 *
 * The optimistic state lasts while the transition runs. On success the action
 * revalidates the page and the real "booked" props arrive in that same
 * transition, so nothing changes on screen. On failure the transition ends
 * and the card goes back to available by itself, with the error shown.
 */
export function useBookGift(item: WishlistItem) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [isConfirming, startTransition] = useTransition();
  const [error, setError] = useState<BookingErrorCode | null>(null);
  const [booking, setBooking] = useOptimistic<Booking>({
    status: item.status,
    bookedBy: item.bookedBy,
  });

  const email = session?.user?.email;

  const book = (event: MouseEvent<HTMLButtonElement>) => {
    // Guests have to sign in before booking; send them to Google and bring them back here.
    if (!email) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    setError(null);
    announceGiftBooked(getBurstOrigin(event.currentTarget));

    startTransition(async () => {
      setBooking({ status: 'booked', bookedBy: email });
      // The server action uses the version for an optimistic concurrency check.
      const result = await bookGift(String(item.id), item.version || 1);

      if (!result.success) {
        announceGiftBookingFailed();
        setError(result.error);
        // Someone else got there first: the action doesn't revalidate on
        // failure, so fetch the page again to show the gift as taken.
        if (result.error === 'alreadyBooked' || result.error === 'versionConflict') {
          router.refresh();
        }
      }
    });
  };

  return {
    isBooked: booking.status === 'booked',
    bookedBy: booking.bookedBy,
    /** Booked on screen, but the server hasn't confirmed yet. */
    isConfirming,
    error,
    book,
    canBook: sessionStatus !== 'loading',
  };
}
