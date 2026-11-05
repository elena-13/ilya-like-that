'use client';

import { memo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { BookButton } from './BookButton';
import { UnbookButton } from './UnbookButton';
import { PrivateBadge } from './PrivateBadge';
import { HandExternalLinkIcon, handInk } from './HandIcons';
import { getItemImage } from '../utils/getItemImage';
import { getItemUrl } from '../utils/getItemUrl';
import { getCardLook } from '../utils/getCardLook';
import { formatBrand } from '../utils/formatBrand';
import { cn } from '@/lib/utils';

type WishlistItemCardProps = {
  item: WishlistItem;
};

const WishlistItemCard = memo(({ item }: WishlistItemCardProps) => {
  const { data: session } = useSession();
  const image = getItemImage(item);
  const itemUrl = getItemUrl(item);
  const look = getCardLook(item.id);

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
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn(
        'relative size-10 cursor-pointer rounded-full bg-transparent hover:bg-background dark:hover:bg-background hover:text-[#b83c2b] hover:rotate-3',
        handInk,
      )}
    >
      <a
        href={item.shopLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open external link"
      >
        <HandExternalLinkIcon className="size-6" />
      </a>
    </Button>
  );

  return (
    <article
      className={cn(
        'group/card @container relative mb-10 mt-4 inline-block w-full rounded-4xl bg-white p-3 pb-4',
        'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(0,0,0,0.15)]',
        'transition-transform duration-300 hover:rotate-0 hover:-translate-y-1',
        look.tilt,
      )}
      aria-label={item.title}
    >
      {/* tape: the outer span places it and casts the shadow, the inner one
          is clipped to the torn shape (a clip would cut the shadow off) */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-[6cqw] z-20',
          'drop-shadow-[0_1px_1.5px_rgb(0_0_0/0.22)]',
          look.tape,
          look.tapeSize,
        )}
      >
        <span
          className={cn('tape-gingham tape-wrinkles block size-full', look.tapeWrinkles)}
          style={{ clipPath: look.tapeEdge }}
        />
      </span>

      <Link
        href={itemUrl}
        className={cn('relative block w-full overflow-hidden rounded-3xl bg-white focus:outline-none', look.shape)}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
          className="object-contain p-4"
        />
      </Link>

      <div className="px-1 pt-3">
        {/* Only admins receive private items, so this is never shown to guests. */}
        {item.isPrivate && <PrivateBadge className="mb-2" />}
        {item.brand && <p className="font-secondary text-xs text-navy/60">{formatBrand(item.brand)}</p>}
        <h3 className="font-secondary text-base leading-snug text-navy line-clamp-2">
          <Link href={itemUrl} className="hover:underline focus:outline-none">
            {item.title}
          </Link>
        </h3>
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

            {shopLinkButton && (
              <div className="absolute top-3 left-3 pointer-events-auto">{shopLinkButton}</div>
            )}

            <div className="absolute top-3 right-3 pointer-events-auto">{bookButton}</div>
          </div>
        </>
      )}

      {/* Clicks pass through the overlay, so reserved gifts can still be opened. */}
      {item.status === 'booked' && (
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden rounded-4xl"
          aria-label="Reserved"
        >
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
