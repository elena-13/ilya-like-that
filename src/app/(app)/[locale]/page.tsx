export const dynamic = 'force-dynamic';

import WishlistList from '@/features/wishlist/components/WishlistList';
import { StarsField } from '@/features/wishlist/components/StarsField';
import { HeroClouds } from '@/widgets/HeroClouds/HeroClouds';
import { AuthSlot } from '@/features/auth/AuthSlot';
import { getWishlistItems } from '@/features/wishlist/data/getWishlistItems';
import { getCurrentUser } from '@/lib/auth-utils';

export default async function Home() {
  const user = await getCurrentUser();
  const items = await getWishlistItems(user?.isAdmin);

  return (
    <main className="min-h-screen">
      <section aria-label="Intro" className="min-h-dvh flex px-4 pb-4 lg:px-8 lg:pb-8 lg:pt-8">
        <div
          className="
            bg-blue p-6 lg:p-8 rounded-4xl flex flex-col gap-16
            bg-linear-to-b from-sky-blue via-sky-pink via-90% to-sky-peach
            relative overflow-clip w-full grow       min-h-full
          "
        >
          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            <AuthSlot />
          </div>

          <div className="relative flex items-center justify-center text-center flex-col gap-6 lg:gap-10 p-6 lg:p-10 grow    min-h-full ">
            <h1 className="text-9xl font-primary font-extrabold text-navy max-w-6xl relative z-20">
              Ilya Like That!
            </h1>
            <p className="text-3xl font-secondary text-navy max-w-2xl z-20">
              A little wishlist for a little human.
            </p>

            <HeroClouds />

            {/* stars */}
            <StarsField />
          </div>
        </div>
      </section>

      <section id="wishlist" aria-label="Wishlist" className="px-4 lg:px-8 py-10 lg:py-16">
        <div className="mx-auto w-full max-w-screen-xl">
          <WishlistList items={items} />
        </div>
      </section>
    </main>
  );
}
