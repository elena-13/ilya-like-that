'use client';

import { memo } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { BookButton } from './BookButton';
import { PrivateBadge } from './PrivateBadge';
import { BookedLabel } from './BookedLabel';
import { CardTape } from './CardTape';
import { UnbookButton } from './UnbookButton';
import { HandExternalLinkIcon } from './HandIcons';
import { getStickerLook, stickerInk } from './Sticker';
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
  const linkSticker = getStickerLook(`${item.id}-link`);
  const bookSticker = getStickerLook(`${item.id}-book`);

  const currentUserEmail = session?.user?.email;
  const isBookedByCurrentUser =
    item.status === 'booked' && Boolean(currentUserEmail) && item.bookedBy === currentUserEmail;

  const bookButton = (
    <BookButton
      id={String(item.id)}
      version={item.version || 1}
      status={item.status}
      bookedBy={item.bookedBy}
      sticker={bookSticker}
    />
  );

  const shopLinkButton = item.shopLink && (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative size-10 cursor-pointer bg-transparent hover:bg-transparent dark:hover:bg-transparent hover:rotate-6 hover:scale-110"
      style={stickerInk(linkSticker)}
    >
      <a
        href={item.shopLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open external link"
      >
        <HandExternalLinkIcon className="size-10" sticker={linkSticker.paper} />
      </a>
    </Button>
  );

  const isBooked = item.status === 'booked';

  return (
    <article
      className={cn(
        'group/card @container relative mb-10 mt-4 inline-block w-full rounded-4xl p-3 pb-4',
        'bg-white',
        'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(0,0,0,0.15)]',
        'transition-transform duration-300 hover:rotate-0 hover:-translate-y-1',
        look.tilt,
      )}
      aria-label={item.title}
    >
      <CardTape look={look} />

      <div className="relative">
        <Link
          href={itemUrl}
          className={cn(
            'relative block w-full overflow-hidden rounded-3xl bg-white focus:outline-none',
            look.shape,
          )}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-contain p-4"
          />
          {/* Booked: fogged glass over the photo, so the gift reads as taken
              but you can still make it out. */}
          {isBooked && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-white/40 backdrop-blur-[3px] backdrop-saturate-50"
            />
          )}
        </Link>

        {/* Booked: an outlined "already gifted" label with the gift sticker at the
            bottom of the photo; clicks pass through to the gift. Your own
            booking shows "your gift", which turns into Cancel booking on
            hover; touch devices show the label and the button. */}
        {isBooked && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-2">
            {isBookedByCurrentUser ? (
              <>
                <span className="[@media(hover:hover)]:hidden">
                  <BookedLabel mine sticker={bookSticker} />
                </span>
                <div className="pointer-events-auto">
                  <UnbookButton
                    id={String(item.id)}
                    sticker={bookSticker}
                    compact
                    restingLabel="your gift"
                  />
                </div>
              </>
            ) : (
              <BookedLabel mine={false} sticker={bookSticker} />
            )}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 px-1 pt-3">
        {/* Booked: the brand and title are frosted too, like the photo. */}
        <div className={cn('min-w-0 flex-1', isBooked && 'blur-[2px] select-none')}>
          {/* Only admins receive private items, so this is never shown to guests. */}
          {item.isPrivate && <PrivateBadge className="mb-2" />}
          {item.brand && (
            <p className="font-secondary text-xs text-navy/60">{formatBrand(item.brand)}</p>
          )}
          <h3 className="font-secondary text-base leading-snug text-navy line-clamp-2">
            <Link href={itemUrl} className="hover:underline focus:outline-none">
              {item.title}
            </Link>
          </h3>
        </div>

        {/* Icons sit at the bottom of the card, next to the title. On desktop
            they appear on hover (or keyboard focus); phones always show them. */}
        {item.status === 'available' && (
          <div className="-mr-1 -mb-1 flex shrink-0 items-center transition-opacity duration-300 md:opacity-0 md:group-hover/card:opacity-100 md:focus-within:opacity-100">
            {shopLinkButton}
            <div>{bookButton}</div>
          </div>
        )}
      </div>
    </article>
  );
});

WishlistItemCard.displayName = 'WishlistItemCard';
export default WishlistItemCard;
