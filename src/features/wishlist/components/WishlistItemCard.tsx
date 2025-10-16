'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

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

      // Это "магия" Next.js: обновляем серверные данные без перезагрузки страницы!
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="relative group rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="p-4 flex flex-col h-full">
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            width={300}
            height={300}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.link && (
              <Button asChild variant="secondary" size="sm">
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            {session && !item.isBooked && (
              <Button onClick={handleBook} disabled={isBooking} size="sm">
                <Gift className="mr-2 h-4 w-4" />
                {isBooking ? 'Booking...' : 'Book this gift'}
              </Button>
            )}
          </div>
        </div>

        <div className="pt-4 text-center flex-grow flex items-center justify-center">
          <h3 className="font-semibold text-gray-800 text-base leading-tight">{item.name}</h3>
        </div>
      </div>

      {/* Overlay: Reserved */}
      {item.isBooked && (
        <div
          className={cn(
            'absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-white',
            'bg-green-500/80 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-90'
          )}
        >
          <span className="bg-white text-green-800 text-sm font-semibold px-4 py-1 rounded-full shadow-sm">
            Reserved
          </span>
        </div>
      )}
    </div>
  );
});

WishlistItemCard.displayName = 'WishlistItemCard';
export default WishlistItemCard;
