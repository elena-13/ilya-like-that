'use client';

import { memo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { BookButton } from './BookButton';
import { UnbookButton } from './UnbookButton';

type WishlistItemCardProps = {
  item: WishlistItem;
};

const WishlistItemCard = memo(({ item }: WishlistItemCardProps) => {
  const { data: session } = useSession();

  const currentUserEmail = session?.user?.email;
  const isBookedByCurrentUser =
    item.status === 'booked' && Boolean(currentUserEmail) && item.bookedBy === currentUserEmail;

  const bookButton = (
    <BookButton
      id={String(item.id)}
      version={item.version || 1}
      status={item.status}
      bookedBy={item.bookedBy}
    />
  );

  const shopLinkButton = item.shopLink && (
    <Button asChild variant="secondary" className="cursor-pointer" size="sm">
      <a
        href={item.shopLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open external link"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  );

  return (
    <article
      className="
        group/card relative mb-4 inline-block w-full overflow-hidden
        rounded-4xl bg-white ring-1 ring-black/5 shadow-sm focus:outline-none
      "
      aria-label={item.title}
    >
      <Link href="/" className="block w-full h-full focus:outline-none">
        <Image
          src="/images/image-22.webp"
          alt={item.title}
          width={800}
          height={1200}
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="w-full h-auto object-cover"
        />
      </Link>

      <div className="px-5 py-3">
        <h3 className="text-navy font-bold leading-snug line-clamp-2">{item.title}</h3>
      </div>

      {item.status === 'available' && (
        <>
          {/* Mobile */}
          <div className="md:hidden absolute top-3 right-3 z-10 flex items-start gap-2">
            {shopLinkButton}
            <div>{bookButton}</div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
            <div className="absolute inset-0 bg-black/40" />

            {shopLinkButton && (
              <div className="absolute top-3 left-3 pointer-events-auto">{shopLinkButton}</div>
            )}

            <div className="absolute top-3 right-3 pointer-events-auto">{bookButton}</div>
          </div>
        </>
      )}

      {item.status === 'booked' && (
        <div className="absolute inset-0 grid place-items-center rounded-4xl" aria-label="Reserved">
          <div className="absolute inset-0 bg-yellow/70" />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy text-white py-2 px-3 font-secondary text-xs">
              {isBookedByCurrentUser ? 'reserved by you' : 'reserved'}
            </span>
          </div>
          {isBookedByCurrentUser && (
            <div className="absolute top-3 right-3 pointer-events-auto">
              <UnbookButton id={String(item.id)} />
            </div>
          )}
        </div>
      )}
    </article>
  );
});

WishlistItemCard.displayName = 'WishlistItemCard';
export default WishlistItemCard;
