import type { Metadata } from 'next';

import { getCurrentUser } from '@/lib/auth-utils';
import { getGiftsBookedBy } from '@/features/wishlist/data/getGiftsBookedBy';
import MyGiftsList from '@/features/wishlist/components/MyGiftsList';
import { SignInPrompt } from '@/features/auth/SignInPrompt';
import PageHeader from '@/widgets/PageHeader/PageHeader';

export const metadata: Metadata = {
  title: 'My gifts | Ilya Like That!',
  description: 'Gifts you have promised to bring',
};

export default async function MyGiftsPage() {
  const user = await getCurrentUser();
  const items = user?.email ? await getGiftsBookedBy(user.email) : [];

  return (
    <>
      <PageHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
        <div>
          <h1 className="text-2xl font-bold text-navy md:text-3xl">My gifts</h1>
          <p className="mt-1 font-secondary text-navy/60">
            Everything you&apos;ve promised to gift. Changed your mind? Cancel a booking so someone
            else can pick it.
          </p>
        </div>

        {user?.email ? (
          <MyGiftsList items={items} />
        ) : (
          <SignInPrompt message="Log in to see the gifts you've booked." />
        )}
      </main>
    </>
  );
}
