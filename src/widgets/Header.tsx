import Link from 'next/link';

import { paths } from '@/lib/paths';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { UserMenu } from '@/components/UserMenu/UserMenu';

export type HeaderProps = {
  user?: User | null;
  onLogin?: () => void; // open auth modal or redirect
  onLogout?: () => void;
};

export default function Header({ user, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex-shrink-0">
            <Link href={paths.home()} className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-bold">🎁 Ilya Like That!</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!user ? (
              <Button variant="default" className="rounded-full" onClick={onLogin}>
                Log in
              </Button>
            ) : (
              <UserMenu user={user} onLogout={onLogout} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
