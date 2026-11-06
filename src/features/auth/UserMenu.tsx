'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import type { Session } from 'next-auth';
import { Gift, LogOut, Settings } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { paths } from '@/lib/paths';

type UserMenuProps = {
  // Session user carries our custom fields (id, isAdmin) unlike next-auth's base User.
  user: Session['user'];
};

function initials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? 'U';
}

export default function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations('auth');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label={t('userMenu')}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? t('userFallback')} />
            <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={paths.myGifts()}>
            <Gift className="h-4 w-4" />
            {t('myGifts')}
          </Link>
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem asChild className="cursor-pointer">
            {/* Plain <a>: the Payload admin lives outside the locale routes. */}
            <a href={paths.admin()}>
              <Settings className="h-4 w-4" />
              {t('manageWishlist')}
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => signOut()} className="cursor-pointer">
          <LogOut className="h-4 w-4" />
          {t('logOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
