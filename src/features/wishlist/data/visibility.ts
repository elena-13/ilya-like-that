import type { Where } from 'payload';

import type { WishlistItem } from '@/payload-types';

// Private items are the admin's own notes; guests never see them.
export function canViewItem(item: Pick<WishlistItem, 'isPrivate'>, isAdmin?: boolean): boolean {
  return !item.isPrivate || Boolean(isAdmin);
}

// Matches only public items. Rows created before the flag existed may hold null, so check both.
export const publicItemsWhere: Where = {
  or: [{ isPrivate: { equals: false } }, { isPrivate: { exists: false } }],
};
