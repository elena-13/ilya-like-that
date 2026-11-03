import { getPayload } from 'payload';
import config from '@payload-config';

import type { WishlistItem } from '@/payload-types';
import { publicItemsWhere } from './visibility';

// Items for the home page, newest first. Admins also get their private items.
export async function getWishlistItems(isAdmin?: boolean): Promise<WishlistItem[]> {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'wishlist-items',
    where: isAdmin ? undefined : publicItemsWhere,
    limit: 100,
    sort: '-createdAt',
  });

  return docs;
}
