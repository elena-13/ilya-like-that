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

type SignInPromptProps = {
  message: string;
  /** Where to return after signing in. Defaults to the current page. */
  callbackUrl?: string;
};

// A white card with the message and the outlined Log in pill.
export function SignInPrompt({ message, callbackUrl }: SignInPromptProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-5 rounded-4xl bg-white p-10 text-center',
        'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(0,0,0,0.15)]',
      )}
    >
      <p className="font-secondary text-lg text-navy">{message}</p>
      <Button
        variant="outline"
        className={stickerPillClass}
        onClick={() => signIn('google', { callbackUrl: callbackUrl ?? window.location.href })}
      >
        <span className={stickerPillIconClass} style={{ color: DEFAULT_STICKER.ink }}>
          <HandLoginIcon className="size-8" sticker={DEFAULT_STICKER.paper} />
        </span>
        Log in with Google
      </Button>
    </div>
  );
}
