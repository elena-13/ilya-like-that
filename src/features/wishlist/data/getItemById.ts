import { kv } from '@vercel/kv';
import { BOOKINGS_KEY } from '@/features/wishlist/constants';
import { getById } from '@/lib/wishlist-db';
import type { WishlistItem } from '@/features/wishlist/types';

export async function getItemById(id: string): Promise<WishlistItem | null> {
  const base = await getById(id);
  if (!base) {
    return null;
  }

  // Booking state lives in the `bookings` hash, written by /api/book.
  const raw = await kv.hget<string>(BOOKINGS_KEY, id);
  const bookedById = raw != null ? String(raw) : null;

  return {
    ...base,
    isBooked: !!bookedById,
    bookedById,
  };
}
