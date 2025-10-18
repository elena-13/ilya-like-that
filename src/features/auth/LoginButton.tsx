'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export function LoginButton() {
  return (
    <Button
      variant="default"
      className="bg-navy max-lg:hidden text-white type-menu px-10 py-6 lg:absolute lg:right-0 lg:top-0 flex items-center justify-center hover:bg-yellow hover:text-navy duration-300 transition-colors"
      onClick={() => signIn('google')}
    >
      Log in
    </Button>
  );
}
