import { kv } from '@vercel/kv';
import { BOOKINGS_KEY } from '@/features/wishlist/constants';
import { getWishlist } from '@/lib/wishlist-db';
import type { WishlistItem } from '@/features/wishlist/types';

/**
 * Load the wishlist (per-item model) and attach booking flags in one pass.
 * Booking state lives in the separate `bookings` hash.
 */
export async function getEnrichedWishlistItems(): Promise<WishlistItem[]> {
  const [baseItems, bookings] = await Promise.all([
    getWishlist(),
    kv.hgetall<Record<string, string>>(BOOKINGS_KEY),
  ]);

  return baseItems.map((item) => {
    const raw = bookings?.[item.id];
    const bookedById = raw != null ? String(raw) : null; // scalar reads can coerce

    return {
      ...item,
      isBooked: !!bookedById,
      bookedById,
    };
  });
}
