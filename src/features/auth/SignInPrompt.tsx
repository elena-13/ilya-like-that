'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { softCardClass } from '@/features/wishlist/styles';
import { HandLoginIcon } from '@/features/wishlist/components/HandIcons';
import {
  DEFAULT_STICKER,
  stickerPillClass,
  PillIcon,
} from '@/features/wishlist/components/Sticker';

type SignInPromptProps = {
  message: string;
  /** Where to return after signing in. Defaults to the current page. */
  callbackUrl?: string;
};

// A white card with the message and the outlined Log in pill.
export function SignInPrompt({ message, callbackUrl }: SignInPromptProps) {
  const t = useTranslations('auth');

  return (
    <div className={cn('flex flex-col items-center gap-5 p-10 text-center', softCardClass)}>
      <p className="font-secondary text-lg text-navy">{message}</p>
      <Button
        variant="outline"
        className={stickerPillClass}
        onClick={() => signIn('google', { callbackUrl: callbackUrl ?? window.location.href })}
      >
        <PillIcon icon={HandLoginIcon} sticker={DEFAULT_STICKER} />
        {t('logInWithGoogle')}
      </Button>
    </div>
  );
}
