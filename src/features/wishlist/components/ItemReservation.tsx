'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Gift, X, CheckCircle2, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ItemReservationProps = {
  itemId: string;
  isBooked: boolean;
  /** User id of the person who booked the item, or null when available. */
  bookedBy: string | null;
};

/**
 * Status block + Book / Unbook controls for a single item.
 * Booking state lives in Redis, so we POST to the API and then
 * router.refresh() to pull the fresh server-rendered state.
 */
export default function ItemReservation({ itemId, isBooked, bookedBy }: ItemReservationProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isBooking, setIsBooking] = useState(false);
  const [isUnbooking, setIsUnbooking] = useState(false);

  const currentUserId = session?.user?.id;
  const isBookedByCurrentUser = isBooked && bookedBy === currentUserId;

  const handleBook = async () => {
    if (!session) {
      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    setIsBooking(true);
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to book the item.');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleUnbook = async () => {
    setIsUnbooking(true);
    try {
      const response = await fetch('/api/unbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to cancel the booking.');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUnbooking(false);
    }
  };

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
          disabled={isBooking || status === 'loading'}
          size="lg"
          className="w-full cursor-pointer sm:w-auto"
        >
          <Gift className="h-4 w-4" />
          {isBooking ? 'Booking…' : 'Book'}
        </Button>
      )}

      {isBookedByCurrentUser && (
        <Button
          onClick={handleUnbook}
          disabled={isUnbooking}
          variant="outline"
          size="lg"
          className="w-full cursor-pointer sm:w-auto"
        >
          <X className="h-4 w-4" />
          {isUnbooking ? 'Cancelling…' : 'Unbook'}
        </Button>
      )}
    </div>
  );
}
