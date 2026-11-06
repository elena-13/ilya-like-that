'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-utils';
import { fail, type BookingResult } from './errors';
import { canViewItem } from '../data/visibility';

export async function bookGift(id: string, currentVersion: number): Promise<BookingResult> {
  const user = await getCurrentUser();

  if (!user?.email) {
    return fail('signInToBook');
  }

  try {
    const payload = await getPayload({ config });
    const item = await payload.findByID({ collection: 'wishlist-items', id });

    // Guests can't see private items, so they can't book them either.
    if (!canViewItem(item, user.isAdmin)) {
      return fail('notFound');
    }

    // Compare-and-swap check: bail out if someone changed the item since it was loaded.
    if ((item.version ?? 1) !== currentVersion) {
      return fail('versionConflict');
    }

    if (item.status === 'booked') {
      return fail('alreadyBooked');
    }

    // Swap: mark as booked and bump the version so concurrent requests fail the check above.
    await payload.update({
      collection: 'wishlist-items',
      id,
      data: {
        status: 'booked',
        bookedBy: user.email,
        version: currentVersion + 1,
      },
    });

    // Invalidate the Next.js cache for the home and item pages so every visitor sees the update.
    // Every page under [locale] (home, item, My gifts) in every language.
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to book gift:', error);
    return fail('bookFailed');
  }
}
