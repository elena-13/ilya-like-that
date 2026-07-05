import { kv } from '@vercel/kv';
import wishlistData from './wishlist.json';
import { BOOKINGS_KEY } from '@/features/wishlist/constants';
import type { WishlistItem } from '@/features/wishlist/types';

export async function getItemById(id: string): Promise<WishlistItem | null> {
  const baseItem = wishlistData.find((item) => item.id === id);

  if (!baseItem) {
    return null;
  }

  // Booking state lives in the `bookings` hash, written by /api/book.
  const bookedById = await kv.hget<string>(BOOKINGS_KEY, id);

  return {
    ...baseItem,
    isBooked: !!bookedById,
    bookedById: bookedById ?? null,
  };
}
