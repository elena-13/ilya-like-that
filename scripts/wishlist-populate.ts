import { kv } from '@vercel/kv';

import wishlistData from '../src/features/wishlist/data/wishlist.json';
import {
  WISHLIST_ORDER_KEY,
  WISHLIST_SEQ_KEY,
  wishlistItemKey,
  wishlistSlugKey,
} from '@/features/wishlist/constants';
import type { WishlistItemBase } from '@/features/wishlist/types';

/**
 * Populate the per-item KV model from wishlist.json.
 *
 * Idempotent: the order list is rebuilt from scratch and item/slug keys are
 * overwritten. Bookings live in a separate hash and are left untouched.
 *
 * Note: if you rename a slug in the JSON between runs, the old slug-index key
 * lingers as an orphan (harmless, but a full reset would need to clear them).
 */
export async function populateWishlistFromJson() {
  // Rebuild order from scratch so re-runs don't append duplicates.
  await kv.del(WISHLIST_ORDER_KEY);

  const pipe = kv.pipeline();
  let maxId = 0;

  for (const raw of wishlistData) {
    const item: WishlistItemBase = {
      id: raw.id,
      slug: raw.slug,
      brand: raw.brand,
      name: raw.name,
      image: raw.image,
      link: raw.link,
    };

    pipe.set(wishlistItemKey(item.id), item);
    pipe.set(wishlistSlugKey(item.slug), item.id);
    pipe.rpush(WISHLIST_ORDER_KEY, item.id);

    maxId = Math.max(maxId, Number(item.id) || 0);
  }

  // Seed the counter so the next addItem() INCR yields a free id.
  pipe.set(WISHLIST_SEQ_KEY, maxId);

  await pipe.exec();

  return { count: wishlistData.length, nextId: maxId + 1 };
}
