import { BOOKINGS_KEY } from '@/features/wishlist/constants';
import { getById } from '@/lib/wishlist-db';
import type { WishlistItem } from '@/features/wishlist/types';
// import { kv } from '@vercel/kv'; // Kept commented out to avoid an unused import

export async function getItemById(id: string): Promise<WishlistItem | null> {
  const base = await getById(id);
  if (!base) {
    return null;
  }

  // const raw = await kv.hget<string>(BOOKINGS_KEY, id);
  // const bookedById = raw != null ? String(raw) : null;

  const bookedById = null;

  return {
    ...base,
    isBooked: !!bookedById,
    bookedById,
  };
}
