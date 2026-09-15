import { kv } from '@vercel/kv';

import {
  BOOKINGS_KEY,
  WISHLIST_ORDER_KEY,
  WISHLIST_SEQ_KEY,
  wishlistItemKey,
  wishlistSlugKey,
} from '@/features/wishlist/constants';
import type { WishlistItemBase } from '@/features/wishlist/types';
import { buildSlug, resolveUniqueSlug } from '@/features/wishlist/slug';

// The product fields an admin supplies; id and slug are managed for them.
export type WishlistItemInput = Pick<WishlistItemBase, 'brand' | 'name' | 'image' | 'link'>;

// Slug availability check backed by the slug index.
const slugTaken = (slug: string) => kv.exists(wishlistSlugKey(slug)).then(Boolean);

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

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

export type Page<T> = {
  items: T[];
  total: number;
  page: number; // 1-based
  pageSize: number;
};

/**
 * One page of items in display order. Reads only this page's ids from the
 * order list (LRANGE) then MGETs them — cost is O(pageSize), not O(total).
 */
export async function getWishlistPage(
  page: number,
  pageSize: number,
): Promise<Page<WishlistItemBase>> {
  const total = await kv.llen(WISHLIST_ORDER_KEY);
  const start = (page - 1) * pageSize;
  const ids = (await kv.lrange<string>(WISHLIST_ORDER_KEY, start, start + pageSize - 1)).map(
    String,
  );

  const items =
    ids.length === 0
      ? []
      : (await kv.mget<WishlistItemBase[]>(...ids.map(wishlistItemKey))).filter(
          (item): item is WishlistItemBase => item != null,
        );

  return { items, total, page, pageSize };
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

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function addItem(input: WishlistItemInput): Promise<WishlistItemBase> {
  // Atomic, coordination-free id allocation.
  const id = String(await kv.incr(WISHLIST_SEQ_KEY));
  const slug = await resolveUniqueSlug(buildSlug(input.brand, input.name), slugTaken);

  const item: WishlistItemBase = {
    id,
    slug,
    brand: input.brand,
    name: input.name,
    image: input.image,
    link: input.link,
  };

  await kv
    .pipeline()
    .set(wishlistItemKey(id), item)
    .set(wishlistSlugKey(slug), id)
    .rpush(WISHLIST_ORDER_KEY, id)
    .exec();

  return item;
}

export async function updateItem(
  id: string,
  patch: Partial<WishlistItemInput>,
): Promise<WishlistItemBase | null> {
  const current = await getById(id);
  if (!current) {
    return null;
  }

  const updated: WishlistItemBase = { ...current, ...patch };
  // Keep the slug in sync with brand/name; the item page's canonical-slug
  // redirect forwards any stale URL to the new one.
  updated.slug = await resolveUniqueSlug(
    buildSlug(updated.brand, updated.name),
    slugTaken,
    current.slug,
  );

  const pipe = kv.pipeline().set(wishlistItemKey(id), updated);
  if (updated.slug !== current.slug) {
    // Move the slug index to point at the new slug.
    pipe.del(wishlistSlugKey(current.slug)).set(wishlistSlugKey(updated.slug), id);
  }
  await pipe.exec();

  return updated;
}

export async function removeItem(id: string): Promise<boolean> {
  const current = await getById(id);
  if (!current) {
    return false;
  }

  await kv
    .pipeline()
    .del(wishlistItemKey(id))
    .del(wishlistSlugKey(current.slug))
    .lrem(WISHLIST_ORDER_KEY, 0, id)
    .hdel(BOOKINGS_KEY, id) // don't leak a booking for a deleted item
    .exec();

  return true;
}
