'use client';

import { useState, useTransition } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Gift, X, CheckCircle2, Lock } from 'lucide-react';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { bookGift } from '../actions/bookGift';
import { unbookGift } from '../actions/unbookGift';

type ItemReservationProps = {
  id: string;
  version: number;
  status: WishlistItem['status'];
  bookedBy?: WishlistItem['bookedBy'];
};

/**
 * Status block + Book / Unbook controls for a single item.
 * Both server actions revalidate the page, so the fresh server-rendered state
 * replaces this component's props after a successful change.
 */
export default function ItemReservation({ id, version, status, bookedBy }: ItemReservationProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentUserEmail = session?.user?.email;
  const isBooked = status === 'booked';
  const isBookedByCurrentUser = isBooked && Boolean(currentUserEmail) && bookedBy === currentUserEmail;

  const runAction = (action: () => ReturnType<typeof bookGift>) => {
    setError(null);

    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        setError(result.error);
      }
    });
  };

  const handleBook = () => {
    // Guests have to sign in before booking; send them to Google and bring them back here.
    if (!currentUserEmail) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    runAction(() => bookGift(id, version));
  };

  const handleUnbook = () => runAction(() => unbookGift(id));

  return (
    <div className="space-y-4">
      {/* Status block */}
      {!isBooked ? (
        <div
          className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 ring-1 ring-green-600/15"
          aria-label="Available"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="font-bold text-navy">Available</p>
            <p className="text-sm text-navy/70">
              This gift hasn&apos;t been reserved yet. Book it to let others know it&apos;s taken.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex items-start gap-3 rounded-2xl bg-yellow/40 p-4 ring-1 ring-navy/10"
          aria-label="Reserved"
        >
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
          <div>
            <p className="font-bold text-navy">Reserved</p>
            <p className="text-sm text-navy/70">
              {isBookedByCurrentUser
                ? 'You reserved this gift. No one else can book it while it stays reserved.'
                : 'Someone has already reserved this gift.'}
            </p>
          </div>
        </div>
      )}

      {/* Buttons */}
      {!isBooked && (
        <Button
          onClick={handleBook}
          disabled={isPending || sessionStatus === 'loading'}
          size="lg"
          className="w-full cursor-pointer sm:w-auto"
        >
          <Gift className="h-4 w-4" />
          {isPending ? 'Booking…' : 'Book'}
        </Button>
      )}

      {isBookedByCurrentUser && (
        <Button
          onClick={handleUnbook}
          disabled={isPending}
          variant="outline"
          size="lg"
          className="w-full cursor-pointer sm:w-auto"
        >
          <X className="h-4 w-4" />
          {isPending ? 'Cancelling…' : 'Unbook'}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
