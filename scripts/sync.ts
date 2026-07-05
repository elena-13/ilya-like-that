import { kv } from '@vercel/kv';

import localWishlistData from '../src/features/wishlist/data/wishlist.json';
import { WISHLIST_KEY } from '@/features/wishlist/constants';
import type { WishlistItemBase } from '@/features/wishlist/types';

async function main() {
  console.log('🚀 Starting wishlist synchronization...');

  // Bookings live in the separate `bookings` hash, so syncing the catalog is a
  // straight overwrite of the base items — nothing to preserve here.
  const items: WishlistItemBase[] = localWishlistData.map(
    ({ id, slug, brand, name, image, link }) => ({ id, slug, brand, name, image, link }),
  );

  console.log(`Saving ${items.length} items to Vercel KV under key: ${WISHLIST_KEY}`);
  await kv.set(WISHLIST_KEY, items);

  console.log('✅ Synchronization complete!');
}

main().catch((err) => {
  console.error('❌ Error during synchronization:', err);
  process.exit(1);
});
