import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { getSession } from '@/lib/auth-utils';
import { getWishlistPage } from '@/lib/wishlist-db';
import { ADMIN_PAGE_SIZE } from '@/features/admin/pagination';
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

  const firstPage = await getWishlistPage(1, ADMIN_PAGE_SIZE);

  return (
    <>
      <PageHeader backLabel="Back to list" />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
        <AdminWishlist initialPage={firstPage} />
      </main>
    </>
  );
}
