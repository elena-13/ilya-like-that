import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';

import type { WishlistItem } from '@/payload-types';

// Cached per request so generateMetadata and the page share a single query.
export const getItemById = cache(async (id: string): Promise<WishlistItem | null> => {
  const payload = await getPayload({ config });

  return payload.findByID({ collection: 'wishlist-items', id, disableErrors: true });
});
