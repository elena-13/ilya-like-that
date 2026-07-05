import type { WishlistItemBase } from '@/features/wishlist/types';
import type { Page, WishlistItemInput } from '@/lib/wishlist-db';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Turn a non-OK response into a thrown Error carrying the server's message.
async function fail(res: Response, fallback: string): Promise<never> {
  throw new Error((await res.text()) || fallback);
}

/** Typed client for the /api/admin/items endpoints. */
export const adminItemsApi = {
  async list(page: number, pageSize: number): Promise<Page<WishlistItemBase>> {
    const res = await fetch(`/api/admin/items?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) return fail(res, 'Failed to load page');
    return res.json();
  },

  async create(values: WishlistItemInput): Promise<WishlistItemBase> {
    const res = await fetch('/api/admin/items', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(values),
    });
    if (!res.ok) return fail(res, 'Failed to add item');
    return res.json();
  },

  async update(id: string, values: WishlistItemInput): Promise<WishlistItemBase> {
    const res = await fetch(`/api/admin/items/${id}`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: JSON.stringify(values),
    });
    if (!res.ok) return fail(res, 'Failed to save item');
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const res = await fetch(`/api/admin/items/${id}`, { method: 'DELETE' });
    if (!res.ok) return fail(res, 'Failed to delete item');
  },
};
