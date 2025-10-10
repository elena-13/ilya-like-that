import { memo } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { WishlistItem } from '../types';

type WishlistItemCardProps = {
  item: WishlistItem;
};

const WishlistItemCard = memo(({ item }: WishlistItemCardProps) => {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'relative group block transition-transform duration-300',
        'hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500'
      )}
    >
      {/* Card container */}
      <div className="bg-white rounded-2xl shadow-sm p-4 h-full flex flex-col">
        {/* Image */}
        <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            width={300}
            height={300}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="pt-4 text-center">
          <h3 className="font-semibold text-gray-800 text-base truncate">{item.name}</h3>
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
    </a>
  );
});

WishlistItemCard.displayName = 'WishlistItemCard';
export default WishlistItemCard;
