import { getTranslations } from 'next-intl/server';

import { StarsField } from '@/features/wishlist/components/StarsField';
import { OwlPeek } from '@/features/invite/components/OwlPeek';
import { OwlRest } from '@/features/invite/components/OwlRest';
import { AuthSlot } from '@/features/auth/AuthSlot';
import { HeroClouds } from '@/widgets/HeroClouds/HeroClouds';
import { LanguageSwitcher } from '@/widgets/LanguageSwitcher/LanguageSwitcher';

// Full-screen sky at the top of the home page: title, tagline, clouds, stars
// and the owl. The data-owl-* attributes tell the owl where it may roam
// (see features/invite/owlSeat.ts).

export async function Hero() {
  const [t, tMeta] = await Promise.all([
    getTranslations('home'),
    getTranslations('metadata'),
  ]);

  return (
    <section
      aria-label={t('introLabel')}
      className="min-h-dvh flex px-4 pb-4 lg:px-8 lg:pb-8 lg:pt-8"
    >
      <div
        data-owl-bounds
        className="relative flex w-full grow flex-col gap-16 overflow-clip rounded-4xl bg-blue bg-linear-to-b from-sky-blue via-sky-pink via-90% to-sky-peach p-6 lg:p-8"
      >
        <div data-owl-avoid className="absolute top-4 left-4 z-30 pointer-events-auto">
          <LanguageSwitcher />
        </div>

        <div data-owl-avoid className="absolute top-4 right-4 z-30 pointer-events-auto">
          <AuthSlot />
        </div>

        <div className="relative flex grow flex-col items-center justify-center gap-6 p-6 text-center lg:gap-10 lg:p-10">
          {/* Heading and tagline let taps through to the owl sitting on a
              cloud behind them (it only sits between the letters). */}
          <h1
            data-owl-avoid="text"
            className="text-6xl sm:text-8xl lg:text-9xl font-primary font-extrabold text-navy max-w-6xl relative z-20 pointer-events-none"
          >
            {tMeta('title')}
          </h1>
          <p
            data-owl-avoid="text"
            className="text-xl sm:text-2xl lg:text-3xl text-balance font-secondary text-navy max-w-2xl z-20 pointer-events-none"
          >
            {t('tagline')}
          </p>

          <HeroClouds
            behindLeftCloud={<OwlPeek side="left" />}
            behindRightCloud={<OwlPeek side="right" />}
          />
          {/* Sits on a cloud once the invite is closed (drawn into the cloud). */}
          <OwlRest />
          <StarsField />
        </div>
      </div>
    </section>
  );
}
