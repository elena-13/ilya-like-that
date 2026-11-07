'use client';

import type { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandGiftIcon } from './HandIcons';
import { stickerIconButtonClass, stickerIconClass, stickerInk, type StickerLook } from './Sticker';

type BookButtonProps = {
  // Die-cut sticker colours for the gift icon.
  sticker: StickerLook;
  // Booking itself lives in the card (useBookGift), so the card can show
  // the gift as booked the moment this is tapped.
  onBook: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

// Icon-only Book button for an available gift's card.
export function BookButton({ sticker, onBook, disabled }: BookButtonProps) {
  const t = useTranslations('wishlist');

  return (
    <Button
      onClick={onBook}
      disabled={disabled}
      variant="ghost"
      size="icon"
      className={cn(stickerIconButtonClass, 'hover:-rotate-6')}
      style={stickerInk(sticker)}
      aria-label={t('book')}
    >
      <HandGiftIcon className={stickerIconClass} sticker={sticker.paper} />
    </Button>
  );
}
