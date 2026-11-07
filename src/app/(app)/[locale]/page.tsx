import { getTranslations } from 'next-intl/server';

import WishlistList from '@/features/wishlist/components/WishlistList';
import { BirthdayInviteProvider } from '@/features/invite/BirthdayInviteProvider';
import { hasInviteAccess } from '@/features/invite/inviteAccess';
import { getWishlistItems } from '@/features/wishlist/data/getWishlistItems';
import { getCurrentUser } from '@/lib/auth-utils';
import { Hero } from '@/widgets/Hero/Hero';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [user, invited, t] = await Promise.all([
    getCurrentUser(),
    hasInviteAccess(),
    getTranslations('home'),
  ]);
  // Needs the user: admins also see their private items.
  const items = await getWishlistItems(user?.isAdmin);

  return (
    <BirthdayInviteProvider invited={invited} signedIn={!!user}>
      <main className="min-h-screen">
        <Hero />

        <section
          id="wishlist"
          aria-label={t('wishlistLabel')}
          className="px-4 lg:px-8 py-10 lg:py-16"
        >
          <div className="mx-auto w-full max-w-screen-xl">
            <WishlistList items={items} />
          </div>
        </section>
      </main>
    </BirthdayInviteProvider>
  );
}
