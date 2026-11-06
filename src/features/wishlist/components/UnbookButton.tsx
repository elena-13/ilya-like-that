'use client';

import { useState, useTransition } from 'react';
import { HandCrossIcon, HandGiftIcon } from './HandIcons';
import {
  DEFAULT_STICKER,
  stickerPillClass,
  stickerPillIconClass,
  type StickerLook,
} from './Sticker';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { unbookGift } from '../actions/unbookGift';

type UnbookButtonProps = {
  id: string;
  // Sticker colours for the gift and the cross; cards pass their Book
  // sticker so the gift looks the same before and after booking.
  sticker?: StickerLook;
  // Smaller pill that fits on a narrow card.
  compact?: boolean;
  // Optional resting text, e.g. "your gift". On devices with a mouse the
  // pill shows it with the gift sticker, and switches to "Cancel booking"
  // when hovered or focused. Touch devices always show "Cancel booking".
  restingLabel?: string;
};

// Only on devices that can hover: resting text by default, action on hover/focus.
const restingClass =
  'hidden items-center [@media(hover:hover)]:inline-flex [@media(hover:hover)]:group-hover/pill:hidden [@media(hover:hover)]:group-focus-visible/pill:hidden';
const actionClass =
  '[@media(hover:hover)]:hidden [@media(hover:hover)]:group-hover/pill:inline-flex [@media(hover:hover)]:group-focus-visible/pill:inline-flex';

// Says what it does in words: a bare X on a reserved card reads like
// "close", so the button is labelled "Cancel booking".
export function UnbookButton({
  id,
  sticker = DEFAULT_STICKER,
  compact = false,
  restingLabel,
}: UnbookButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUnbook = () => {
    setError(null);

    startTransition(async () => {
      const result = await unbookGift(id);

      // On success the action revalidates the page, so the item re-renders as available.
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  const iconSize = compact ? 'size-7' : 'size-8';

  return (
    <>
      <Button
        onClick={handleUnbook}
        disabled={isPending}
        variant="outline"
        className={cn(stickerPillClass, compact && 'h-10 gap-1.5 pl-1.5 pr-3.5 text-sm')}
        aria-label="Cancel booking"
      >
        {restingLabel && !isPending && (
          <span className={cn(restingClass, 'gap-1.5')}>
            <span style={{ color: sticker.ink }}>
              <HandGiftIcon className={iconSize} sticker={sticker.paper} />
            </span>
            {restingLabel}
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center gap-1.5',
            restingLabel && !isPending && actionClass,
          )}
        >
          <span className={stickerPillIconClass} style={{ color: sticker.ink }}>
            <HandCrossIcon className={iconSize} sticker={sticker.paper} />
          </span>
          {isPending ? 'Cancelling…' : 'Cancel booking'}
        </span>
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-500">
          {error}
        </p>
      )}
    </>
  );
}
