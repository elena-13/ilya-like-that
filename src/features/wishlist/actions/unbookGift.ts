'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-utils';

type UnbookGiftResult = { success: true } | { success: false; error: string };

const fail = (error: string): UnbookGiftResult => ({ success: false, error });

export async function unbookGift(id: string): Promise<UnbookGiftResult> {
  const user = await getCurrentUser();

  if (!user?.email) {
    return fail('Please sign in with Google to cancel a booking.');
  }

  try {
    const payload = await getPayload({ config });
    const item = await payload.findByID({ collection: 'wishlist-items', id });

    if (item.status !== 'booked') {
      return fail('This gift is not booked.');
    }

    // Only the guest who made the booking may cancel it.
    if (item.bookedBy !== user.email) {
      return fail('You can only cancel your own booking.');
    }

    // Bump the version so any booking attempt made against the old state fails its check.
    await payload.update({
      collection: 'wishlist-items',
      id,
      data: {
        status: 'available',
        bookedBy: null,
        version: (item.version ?? 1) + 1,
      },
    });

    revalidatePath('/');
    revalidatePath('/item/[slug]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to unbook gift:', error);
    return fail('Something went wrong while cancelling the booking. Please try again.');
  }
}
