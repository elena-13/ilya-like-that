'use client';

import { useSession } from 'next-auth/react';

import { Skeleton } from '@/components/ui/skeleton';
import UserMenu from '@/features/auth/UserMenu';
import { LoginButton } from '@/features/auth/LoginButton';

export function AuthSlot() {
  const { data, status } = useSession();
  const user = data?.user;

  if (status === 'loading') {
    return <Skeleton className="h-9 w-24 rounded-full" />;
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'authenticated' && user && <UserMenu user={user} />}
      {status === 'unauthenticated' && <LoginButton />}
    </div>
  );
}
