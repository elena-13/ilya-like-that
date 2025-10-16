'use client';

import { useSession } from 'next-auth/react';

import UserMenu from '@/features/auth/UserMenu';

import { AuthSkeleton } from './parts/AuthSkeleton';
import { LoginButton } from './parts/LoginButton';
import { BrandLink } from './parts/BrandLink';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* left */}
          <BrandLink />

          {/* right */}
          <div className="flex items-center gap-2">
            {status === 'loading' && <AuthSkeleton />}
            {status === 'authenticated' && user && <UserMenu user={user} />}
            {status === 'unauthenticated' && <LoginButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
