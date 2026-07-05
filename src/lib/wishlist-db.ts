import { kv } from '@vercel/kv';

import { WISHLIST_KEY } from '@/features/wishlist/constants';
import type { WishlistItemBase } from '@/features/wishlist/types';

export async function getWishlist(): Promise<WishlistItemBase[]> {
  const items = await kv.get<WishlistItemBase[]>(WISHLIST_KEY);
  return items || [];
}
