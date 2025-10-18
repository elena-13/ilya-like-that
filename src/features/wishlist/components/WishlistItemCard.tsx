'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import { WishlistItem } from '../types';
import { Button } from '@/components/ui/button';
import { ExternalLink, Gift } from 'lucide-react';

type WishlistItemCardProps = {
  item: WishlistItem;
};

const WishlistItemCard = memo(({ item }: WishlistItemCardProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);

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
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0
                 transition-opacity duration-300
                 group-hover/card:opacity-100"
        >
          <div className="absolute inset-0 bg-black/40" />

          {item.link && (
            <div className="absolute top-3 left-3 pointer-events-auto">
              <Button asChild variant="secondary" size="sm">
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

          {/* Booking */}
          <div className="absolute top-3 right-3 pointer-events-auto">
            <Button onClick={handleBook} disabled={isBooking} variant="secondary" size="sm">
              <Gift className="mr-2 h-4 w-4" />
              {isBooking ? 'Booking...' : 'Book this gift'}
            </Button>
          </div>
        </div>
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
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy text-white py-2 px-3 font-secondary text-sm">
              Reserved
            </span>
          </div>
        </div>
      )}
    </article>
  );
});

WishlistItemCard.displayName = 'WishlistItemCard';
export default WishlistItemCard;
