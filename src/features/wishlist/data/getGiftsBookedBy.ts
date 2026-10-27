import { getPayload } from 'payload';
import config from '@payload-config';

import type { WishlistItem } from '@/payload-types';

// Gifts reserved by the given guest, most recently booked first.
export async function getGiftsBookedBy(email: string): Promise<WishlistItem[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'wishlist-items',
    where: {
      status: { equals: 'booked' },
      bookedBy: { equals: email },
    },
    limit: 100,
    // Booking bumps updatedAt, so this approximates booking order.
    sort: '-updatedAt',
  });

  return docs;
}
