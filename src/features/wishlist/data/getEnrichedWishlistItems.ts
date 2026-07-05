import { kv } from '@vercel/kv';
import { BOOKINGS_KEY, WISHLIST_KEY } from '@/features/wishlist/constants';
import type { WishlistItem, WishlistItemBase } from '@/features/wishlist/types';

/**
 * Load wishlist and attach booking flags in one pass.
 * Uses HMGET for deterministic mapping by ids.
 */
export async function getEnrichedWishlistItems(): Promise<WishlistItem[]> {
  // Fetch base wishlist items (without booking info)
  const baseItems = await kv.get<WishlistItemBase[]>(WISHLIST_KEY);

  if (!baseItems) {
    return [];
  }

  // Get all bookings in one call - returns object like { itemId: userId }
  const bookings = await kv.hgetall<Record<string, string>>(BOOKINGS_KEY);

  // Enrich each item with booking information
  const enrichedItems = baseItems.map((item) => {
    const bookedById = bookings?.[item.id] || null;

    return {
      ...item,
      isBooked: !!bookedById, // Convert to boolean
      bookedById: bookedById,
    };
  });

  return enrichedItems;
}
