'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-utils';

type BookGiftResult = { success: true } | { success: false; error: string };

const fail = (error: string): BookGiftResult => ({ success: false, error });

export async function bookGift(id: string, currentVersion: number): Promise<BookGiftResult> {
  const user = await getCurrentUser();

  if (!user?.email) {
    return fail('Please sign in with Google to book a gift.');
  }

  try {
    const payload = await getPayload({ config });
    const item = await payload.findByID({ collection: 'wishlist-items', id });

    // Compare-and-swap check: bail out if someone changed the item since it was loaded.
    if ((item.version ?? 1) !== currentVersion) {
      return fail('Oops! Someone else has just booked this gift. Please refresh the page.');
    }

    if (item.status === 'booked') {
      return fail('This gift has already been booked.');
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
    revalidatePath('/');
    revalidatePath('/item/[slug]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to book gift:', error);
    return fail('Something went wrong while booking the gift. Please try again.');
  }
}
