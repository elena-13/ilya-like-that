'use client';

import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandLoginIcon } from '@/features/wishlist/components/HandIcons';
import {
  DEFAULT_STICKER,
  stickerPillClass,
  stickerPillIconClass,
} from '@/features/wishlist/components/Sticker';

// Outlined pill with a die-cut sticker icon, in the same hand-drawn
// style as the icons on the wishlist cards.
export function LoginButton() {
  return (
    <Button
      variant="outline"
      className={cn(stickerPillClass, 'lg:absolute lg:right-0 lg:top-0')}
      onClick={() => signIn('google')}
    >
      <span className={stickerPillIconClass} style={{ color: DEFAULT_STICKER.ink }}>
        <HandLoginIcon className="size-8" sticker={DEFAULT_STICKER.paper} />
      </span>
      Log in
    </Button>
  );
}
