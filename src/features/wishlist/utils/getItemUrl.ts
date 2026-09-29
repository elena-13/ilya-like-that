import type { WishlistItem } from '@/payload-types';
import { paths } from '@/lib/paths';

// "Dyson V15 Detect!" -> "dyson-v15-detect". Falls back to "gift" for titles
// without latin letters or digits, so the URL always has a readable part.
export function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'gift';
}

export function getItemUrl(item: Pick<WishlistItem, 'id' | 'title'>): string {
  return paths.item(slugify(item.title), String(item.id));
}
