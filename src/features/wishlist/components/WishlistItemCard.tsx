'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';

import { WishlistItem } from '../types';
import { Button } from '@/components/ui/button';
import { ExternalLink, Gift, X } from 'lucide-react';

type WishlistItemCardProps = {
  item: WishlistItem;
};

const WishlistItemCard = memo(({ item }: WishlistItemCardProps) => {
  const { data: session, status } = useSession();

  const router = useRouter();

  const [isBooking, setIsBooking] = useState(false);
  const [isUnbooking, setIsUnbooking] = useState(false);

  const currentUserId = session?.user?.id;

  const isBookedByCurrentUser = item.isBooked && item.bookedById === currentUserId;

  const handleBook = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsBooking(true);
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to book the item.');
      }

      // This is the "magic" of Next.js: updating server-side data without reloading the page!
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleBookingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!session) {
      e.preventDefault();
      e.stopPropagation();

      signIn('google', { callbackUrl: window.location.href });
      return;
    }

    handleBook(e);
  };

  const handleUnbook = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Важно, чтобы не сработали другие клики

    setIsUnbooking(true);
    try {
      const response = await fetch('/api/unbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to cancel the booking.');
      }

      // Обновляем страницу, чтобы увидеть изменения
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUnbooking(false);
    }
  };

  return (
    <article
      className="
        group/card relative mb-4 inline-block w-full overflow-hidden
        rounded-4xl bg-white ring-1 ring-black/5 shadow-sm focus:outline-none
      "
      aria-label={item.name}
    >
      <Image
        src={item.image}
        alt={item.name}
        width={800}
        height={1200}
        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
        className="w-full h-auto object-cover"
      />

      <div className="px-5 py-3">
        <h3 className="text-navy font-bold leading-snug line-clamp-2">{item.name}</h3>
      </div>

      {!item.isBooked && (
        <>
          {/* Mobile */}
          <div className="md:hidden absolute top-3 right-3 z-10 flex gap-2">
            {item.link && (
              <Button asChild variant="secondary" className="cursor-pointer" size="sm">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open external link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              onClick={handleBookingClick}
              disabled={isBooking || status === 'loading'}
              variant="secondary"
              className="cursor-pointer"
              size="sm"
            >
              <Gift className="h-4 w-4" />
              Book
            </Button>
          </div>

          {/* Desktop */}
          <div className="hidden md:block pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
            <div className="absolute inset-0 bg-black/40" />

            {item.link && (
              <div className="absolute top-3 left-3 pointer-events-auto">
                <Button asChild variant="secondary" className="cursor-pointer" size="sm">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open external link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}

            <div className="absolute top-3 right-3 pointer-events-auto">
              <Button
                onClick={handleBookingClick}
                disabled={isBooking || status === 'loading'}
                variant="secondary"
                className="cursor-pointer"
                size="sm"
              >
                <Gift className="h-4 w-4" />
                Book
              </Button>
            </div>
          </div>
        </>
      )}

      {item.isBooked && (
        <div
          className="
                    absolute inset-0 grid place-items-center
                    rounded-4xl
                  "
          aria-label="Reserved"
        >
          <div className="absolute inset-0 bg-yellow/70" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy text-white py-2 px-3 font-secondary text-xs">
              {isBookedByCurrentUser ? ' You reserved' : 'Reserved'}
            </span>
          </div>
          {isBookedByCurrentUser && (
            <div className="absolute top-3 right-3 pointer-events-auto">
              <Button
                onClick={handleUnbook}
                disabled={isUnbooking}
                size="sm"
                className="bg-navy text-white rounded-full  font-secondary text-xs cursor-pointer"
              >
                <X />
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
});

WishlistItemCard.displayName = 'WishlistItemCard';
export default WishlistItemCard;
