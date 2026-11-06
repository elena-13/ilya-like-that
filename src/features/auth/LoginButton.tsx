'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandLoginIcon } from '@/features/wishlist/components/HandIcons';
import {
  DEFAULT_STICKER,
  stickerPillClass,
  PillIcon,
} from '@/features/wishlist/components/Sticker';

// Outlined pill with a die-cut sticker icon, in the same hand-drawn
// style as the icons on the wishlist cards.
export function LoginButton() {
  const t = useTranslations('auth');

  return (
    <Button
      variant="outline"
      className={cn(stickerPillClass, 'lg:absolute lg:right-0 lg:top-0')}
      onClick={() => signIn('google')}
    >
      <PillIcon icon={HandLoginIcon} sticker={DEFAULT_STICKER} />
      {t('logIn')}
    </Button>
  );
}
