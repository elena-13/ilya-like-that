'use client';

import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { HandLoginIcon } from '@/features/wishlist/components/HandIcons';

// Outlined pill with a die-cut sticker icon, in the same hand-drawn
// style as the icons on the wishlist cards.
const STICKER = { paper: '#f78fb0', ink: '#7a1e3a' };

export function LoginButton() {
  return (
    <Button
      variant="outline"
      className="
        group/login h-11 cursor-pointer gap-2 rounded-full border-2 border-navy bg-transparent
        pl-2 pr-5 font-secondary text-base text-navy shadow-none
        transition-[background-color,rotate,scale] duration-300
        hover:-rotate-2 hover:bg-background hover:text-navy
        dark:border-navy dark:bg-transparent dark:hover:bg-background
        lg:absolute lg:right-0 lg:top-0
      "
      onClick={() => signIn('google')}
    >
      <span
        className="transition-transform duration-300 group-hover/login:scale-110 group-hover/login:rotate-6"
        style={{ color: STICKER.ink }}
      >
        <HandLoginIcon className="size-8" sticker={STICKER.paper} />
      </span>
      Log in
    </Button>
  );
}
