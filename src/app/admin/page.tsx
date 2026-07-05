import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { getSession } from '@/lib/auth-utils';
import { getWishlist } from '@/lib/wishlist-db';
import AdminWishlist from '@/features/admin/AdminWishlist';
import PageHeader from '@/widgets/PageHeader/PageHeader';

export const metadata: Metadata = {
  title: 'Admin | My Wishlist',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const items = await getWishlist();

  return (
    <>
      <PageHeader backLabel="Back to list" />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
        <AdminWishlist initialItems={items} />
      </main>
    </>
  );
}
