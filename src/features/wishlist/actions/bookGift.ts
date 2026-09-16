'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { revalidatePath } from 'next/cache';

type BookGiftResult = { success: true } | { success: false; error: string };

export async function bookGift(id: string, currentVersion: number): Promise<BookGiftResult> {
  const payload = await getPayload({ config });

  try {
    const item = await payload.findByID({
      collection: 'wishlist-items',
      id,
    });

    // Compare-and-swap check: bail out if someone changed the item since it was loaded.
    if (item.version !== currentVersion) {
      return {
        success: false,
        error: 'Oops! Someone else has just booked this gift. Please refresh the page.',
      };
    }

    if (item.status === 'booked') {
      return { success: false, error: 'This gift has already been booked.' };
    }

    // Swap: mark as booked and bump the version so concurrent requests fail the check above.
    await payload.update({
      collection: 'wishlist-items',
      id,
      data: {
        status: 'booked',
        version: currentVersion + 1,
      },
    });

    // Invalidate the Next.js cache for the home page so every visitor sees the update.
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to book gift:', error);
    return {
      success: false,
      error: 'Something went wrong while booking the gift. Please try again.',
    };
  }
}
