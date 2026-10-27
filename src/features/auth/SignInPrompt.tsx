'use client';

import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';

type SignInPromptProps = {
  message: string;
  /** Where to return after signing in. Defaults to the current page. */
  callbackUrl?: string;
};

export function SignInPrompt({ message, callbackUrl }: SignInPromptProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center bg-white/50">
      <p className="text-gray-600">{message}</p>
      <Button
        className="mt-6 bg-navy text-white cursor-pointer"
        onClick={() => signIn('google', { callbackUrl: callbackUrl ?? window.location.href })}
      >
        Log in with Google
      </Button>
    </div>
  );
}
