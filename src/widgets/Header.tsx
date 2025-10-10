import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-gray-800 hover:text-green-600 transition-colors"
            >
              <Image src="/logo_i.svg" alt="logomark" width={20} height={20} />
              <span className="text-lg font-bold"> ILYA Like That!</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* {!user ? (
              <Button variant="default" className="rounded-full" onClick={onLogin}>
                Log in
              </Button>
            ) : (
              <UserMenu user={user} onLogout={onLogout} onProfile={onProfile} />
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}
