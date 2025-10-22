import { kv } from '@vercel/kv';

import localWishlistData from '../src/features/wishlist/data/wishlist.json';
import { WISHLIST_KEY } from '@/features/wishlist/constants';

export type LocalWishlistItem = {
  id: string;
  brand: string;
  name: string;
  image: string;
  link: string;
  isBooked: boolean;
  bookedBy: string | null;
};

async function main() {
  console.log('🚀 Starting wishlist synchronization...');

  // 1. FETCH CURRENT DATA FROM VERCEL KV
  console.log(`Fetching current data from KV under key: ${WISHLIST_KEY}`);
  const currentData = await kv.get<LocalWishlistItem[]>(WISHLIST_KEY);

  // If KV is empty (e.g., first run), default to an empty array.
  const currentItems = Array.isArray(currentData) ? currentData : [];
  console.log(`Found ${currentItems.length} items currently in the database.`);

  // 2. CREATE A MAP FOR QUICK ACCESS TO BOOKING STATUSES
  // The map will look like: { "itemId": { isBooked: true, bookedById: '...' } }
  // This allows us to efficiently look up booking info for existing items.
  const bookingStatusMap = new Map<string, { isBooked: boolean; bookedBy: string | null }>();
  for (const item of currentItems) {
    if (item.isBooked) {
      bookingStatusMap.set(item.id, {
        isBooked: item.isBooked,
        bookedBy: item.bookedBy,
      });
    }
  }
  console.log(`Found ${bookingStatusMap.size} booked items to preserve.`);

  // 3. SYNCHRONIZE LOCAL JSON FILE WITH DATA FROM KV
  // Iterate over the "fresh" list from your local JSON file and apply existing booking statuses.
  const synchronizedItems: LocalWishlistItem[] = localWishlistData.map((localItem) => {
    const bookingStatus = bookingStatusMap.get(localItem.id);

    // If a booking status exists for this item ID, apply it.
    if (bookingStatus) {
      console.log(`  -> Preserving booking for item: ${localItem.name}`);
      return {
        ...localItem, // Take fresh data (name, link, etc.) from the local file
        ...bookingStatus, // And merge it with the existing booking status from KV
      };
    }

    // If not booked, just return the item as is from the local file.
    return localItem as LocalWishlistItem;
  });

  // 4. WRITE THE MERGED LIST BACK TO VERCEL KV
  console.log('Saving synchronized data back to Vercel KV...');
  await kv.set(WISHLIST_KEY, synchronizedItems);

  console.log('✅ Synchronization complete! All bookings have been preserved.');
}

main().catch((err) => {
  console.error('❌ Error during synchronization:', err);
  process.exit(1);
});
