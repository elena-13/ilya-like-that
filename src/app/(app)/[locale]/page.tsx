export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';

import WishlistList from '@/features/wishlist/components/WishlistList';
import { StarsField } from '@/features/wishlist/components/StarsField';
import { HeroClouds } from '@/widgets/HeroClouds/HeroClouds';
import { BirthdayInviteProvider } from '@/features/invite/BirthdayInviteProvider';
import { OwlPeek } from '@/features/invite/components/OwlPeek';
import { OwlRest } from '@/features/invite/components/OwlRest';
import { LanguageSwitcher } from '@/widgets/LanguageSwitcher/LanguageSwitcher';
import { AuthSlot } from '@/features/auth/AuthSlot';
import { getWishlistItems } from '@/features/wishlist/data/getWishlistItems';
import { getCurrentUser } from '@/lib/auth-utils';

export default async function Home() {
  const user = await getCurrentUser();
  const items = await getWishlistItems(user?.isAdmin);
  const t = await getTranslations('home');
  const tMeta = await getTranslations('metadata');

  return (
    <BirthdayInviteProvider>
      <main className="min-h-screen">
        <section
          aria-label={t('introLabel')}
          className="min-h-dvh flex px-4 pb-4 lg:px-8 lg:pb-8 lg:pt-8"
        >
          <div
            data-owl-bounds
            className="
            bg-blue p-6 lg:p-8 rounded-4xl flex flex-col gap-16
            bg-linear-to-b from-sky-blue via-sky-pink via-90% to-sky-peach
            relative overflow-clip w-full grow       min-h-full
          "
          >
            <div data-owl-avoid className="absolute top-4 left-4 z-30 pointer-events-auto">
              <LanguageSwitcher />
            </div>

            <div data-owl-avoid className="absolute top-4 right-4 z-30 pointer-events-auto">
              <AuthSlot />
            </div>

            <div className="relative flex items-center justify-center text-center flex-col gap-6 lg:gap-10 p-6 lg:p-10 grow    min-h-full ">
              <h1
                data-owl-avoid="text"
                className="text-9xl font-primary font-extrabold text-navy max-w-6xl relative z-20"
              >
                {tMeta('title')}
              </h1>
              <p data-owl-avoid="text" className="text-3xl font-secondary text-navy max-w-2xl z-20">
                {t('tagline')}
              </p>

              <HeroClouds
                behindLeftCloud={<OwlPeek side="left" />}
                behindRightCloud={<OwlPeek side="right" />}
              />
              {/* Sits on a cloud once the invite is closed (drawn into the cloud). */}
              <OwlRest />

              {/* stars */}
              <StarsField />
            </div>
          </div>
        </section>

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
