'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-utils';
import { fail, type BookingResult } from './errors';

export async function unbookGift(id: string): Promise<BookingResult> {
  const user = await getCurrentUser();

  if (!user?.email) {
    return fail('signInToCancel');
  }

  try {
    const payload = await getPayload({ config });
    const item = await payload.findByID({ collection: 'wishlist-items', id });

    if (item.status !== 'booked') {
      return fail('notBooked');
    }

    // Only the guest who made the booking may cancel it.
    if (item.bookedBy !== user.email) {
      return fail('notYours');
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

    // Every page under [locale] (home, item, My gifts) in every language.
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to unbook gift:', error);
    return fail('cancelFailed');
  }
}
