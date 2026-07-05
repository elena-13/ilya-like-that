// Keys for Vercel KV

// Booking state: hash of { itemId: userId }.
export const BOOKINGS_KEY = 'bookings';

// Legacy single-array blob. Kept only so the migration can read/clean it up.
export const WISHLIST_KEY = 'wishlist';

// Per-item model (see wishlist-db.ts):
export const WISHLIST_SEQ_KEY = 'wishlist:seq'; // atomic id counter (INCR)
export const WISHLIST_ORDER_KEY = 'wishlist:ids'; // list of ids in display order

export const wishlistItemKey = (id: string) => `wishlist:item:${id}`;
export const wishlistSlugKey = (slug: string) => `wishlist:slug:${slug}`;
