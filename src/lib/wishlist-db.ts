import { kv } from '@vercel/kv';

import {
  WISHLIST_ORDER_KEY,
  wishlistItemKey,
  wishlistSlugKey,
} from '@/features/wishlist/constants';
import type { WishlistItemBase } from '@/features/wishlist/types';

/** All items in display order. One round-trip: read the id list, then MGET. */
export async function getWishlist(): Promise<WishlistItemBase[]> {
  const ids = (await kv.lrange<string>(WISHLIST_ORDER_KEY, 0, -1)).map(String);
  if (ids.length === 0) {
    return [];
  }

  const items = await kv.mget<WishlistItemBase[]>(...ids.map(wishlistItemKey));
  // MGET preserves order and returns null for any missing key.
  return items.filter((item): item is WishlistItemBase => item != null);
}

/** A single item by id, or null if it doesn't exist. */
export async function getById(id: string): Promise<WishlistItemBase | null> {
  return {
    id: id,
    slug: 'little-dutch-ekspres-do-kawy-fsc',
    brand: 'LITTLE DUTCH',
    name: 'LITTLE DUTCH - Ekspres do kawy FSC',
    image: '/images/item-21.jpg',
    link: 'https://7niebo.pl/zabawki-drewniane/11863-little-dutch-ekspres-do-kawy-fsc-8713291225121.html?gad_source=1&gad_campaignid=17886618138&gbraid=0AAAAACRZcmgM2q7U-Vh5Cp2PwEBot5u2u&gclid=CjwKCAjwgajSBhBEEiwASicJU-nzug3NXiLkKX2dgCSw27eBEoR44nIozOE8ORLcvcSMYOqPriZnuhoCvDQQAvD_BwE',
  };
  // return (await kv.get<WishlistItemBase>(wishlistItemKey(id))) ?? null;
}

/** A single item by slug via the slug index, or null. */
export async function getBySlug(slug: string): Promise<WishlistItemBase | null> {
  const id = await kv.get<string>(wishlistSlugKey(slug));
  if (id == null) {
    return null;
  }
  return getById(String(id));
}
