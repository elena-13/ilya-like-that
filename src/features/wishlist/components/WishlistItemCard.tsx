'use client';

import { useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import type { WishlistItem } from '@/payload-types';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { BookButton } from './BookButton';
import { BookedLabel } from './BookedLabel';
import { CardTape } from './CardTape';
import { PrivateBadge } from './PrivateBadge';
import { ShopLinkButton } from './ShopLinkButton';
import { getItemStickers } from './Sticker';
import { UnbookButton } from './UnbookButton';
import { useBookGift } from '../hooks/useBookGift';
import { cardShadowClass } from '../styles';
import { formatBrand } from '../utils/formatBrand';
import { getCardLook } from '../utils/getCardLook';
import { getItemImage } from '../utils/getItemImage';
import { getItemUrl } from '../utils/getItemUrl';

type WishlistItemCardProps = {
  item: WishlistItem;
};

// A plain function, not memo(): the list is rendered on the server, and React
// can't match a memo() client component across server refreshes, so every
// card remounted after a booking. On iPhone the list briefly emptied and the
// page jumped. (Memo saved nothing here anyway: each refresh sends new props.)
export default function WishlistItemCard({ item }: WishlistItemCardProps) {
  const { data: session } = useSession();
  const t = useTranslations('wishlist');
  const image = getItemImage(item);
  const itemUrl = getItemUrl(item);
  const look = getCardLook(item.id);
  const stickers = getItemStickers(item.id);

  const tErrors = useTranslations('errors');
  // Booked state as shown: switches to booked the moment Book is tapped.
  const { isBooked, bookedBy, isConfirming, error, book, canBook } = useBookGift(item);
  const isBookedByCurrentUser =
    isBooked && Boolean(session?.user?.email) && bookedBy === session?.user?.email;
  // Booked while the page is open (not already booked on load): the labels
  // fade in along with the frosting instead of popping up.
  const bookedOnLoad = useRef(isBooked);
  const justBooked = isBooked && !bookedOnLoad.current;

  return (
    <article
      className={cn(
        'group/card @container relative mb-10 mt-4 inline-block w-full rounded-4xl bg-white p-3 pb-4',
        cardShadowClass,
        // Only transform changes on hover, so the browser animates it on the
        // GPU by itself. Cards aren't forced onto their own layer for good:
        // a permanently composited tilted card renders its text soft.
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
            // Booked: the photo itself is blurred and faded (fogged glass). A
            // plain filter is drawn once with the card and reused when the card
            // moves or scrolls; backdrop-filter re-blurred what's behind it on
            // every frame. No forced GPU layer here: it would also pull the pill
            // and tape onto layers, and tilted layers render text soft.
            // The filter eases in when the gift gets booked.
            className={cn(
              'object-contain p-4 transition-[filter] duration-700 ease-out',
              isBooked && 'blur-[3px] saturate-50',
            )}
          />
          {/* Always rendered, so the white haze fades in rather than popping. */}
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 bg-white/40 transition-opacity duration-700 ease-out',
              !isBooked && 'opacity-0',
            )}
          />
        </Link>

        {/* Booked: an outlined "reserved" label with the gift sticker at the
            bottom of the photo; clicks pass through to the gift. Your own
            booking shows "your gift", which turns into Cancel booking on
            hover; touch devices show the label and the button. */}
        {isBooked && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-2 flex flex-col items-center gap-2',
              justBooked && 'motion-safe:animate-[booked-in_500ms_ease-out_200ms_both]',
            )}
          >
            {isBookedByCurrentUser && isConfirming ? (
              // Booked on screen, not yet saved: no Cancel until the server
              // confirms (the card's version is still the old one till then).
              <BookedLabel mine sticker={stickers.book} />
            ) : isBookedByCurrentUser ? (
              <>
                <span className="[@media(hover:hover)]:hidden">
                  <BookedLabel mine sticker={stickers.book} />
                </span>
                <div className="pointer-events-auto">
                  <UnbookButton
                    id={String(item.id)}
                    sticker={stickers.book}
                    compact
                    restingLabel={t('yourGift')}
                  />
                </div>
              </>
            ) : (
              <BookedLabel mine={false} sticker={stickers.book} />
            )}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 px-1 pt-3">
        {/* Booked: the brand and title are frosted too, like the photo. */}
        <div
          className={cn(
            'min-w-0 flex-1 transition-[filter] duration-700 ease-out',
            isBooked && 'blur-[2px] select-none',
          )}
        >
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
        {/* Booked cards keep an empty spot the size of the icons (40px, 48px on touch), so
            the title wraps the same and the card doesn't jump when booking. */}
        {isBooked ? (
          <div
            aria-hidden
            className={cn(
              '-mr-1 -mb-1 h-10 shrink-0 touch:h-12',
              item.shopLink ? 'w-20 touch:w-24' : 'w-10 touch:w-12',
            )}
          />
        ) : (
          <div className="-mr-1 -mb-1 flex shrink-0 items-center transition-opacity duration-300 md:opacity-0 md:group-hover/card:opacity-100 md:focus-within:opacity-100">
            {item.shopLink && <ShopLinkButton href={item.shopLink} sticker={stickers.link} />}
            <BookButton sticker={stickers.book} onBook={book} disabled={!canBook} />
          </div>
        )}
      </div>

      {/* Booking failed: the card is back to available, with the reason. */}
      {error && (
        <p role="alert" className="px-1 pt-2 text-sm text-red-500">
          {tErrors(error)}
        </p>
      )}
    </article>
  );
}
