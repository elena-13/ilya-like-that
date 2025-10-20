import { kv } from '@vercel/kv';
import { BOOKINGS_KEY } from '@/features/wishlist/constants';

export async function debugBookings() {
  const count = await kv.hlen(BOOKINGS_KEY); // how many entries
  const keys = await kv.hkeys(BOOKINGS_KEY); // which item ids
  return { count, keys };
}
