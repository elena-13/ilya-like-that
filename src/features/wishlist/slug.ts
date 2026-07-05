import { slugify } from '@/lib/utils';

/** URL-safe, never-empty base slug from a product's brand + name. */
export function buildSlug(brand: string, name: string): string {
  return slugify(`${brand} ${name}`) || 'item';
}

/**
 * Resolve `base` to a free slug, appending -2, -3, … on collision.
 *
 * `isTaken` decides availability — kept abstract so this stays storage-free
 * and unit-testable. `ownSlug` counts as free, so an item can keep its slug
 * during an in-place update.
 */
export async function resolveUniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
  ownSlug?: string,
): Promise<string> {
  let candidate = base;
  let suffix = 2;
  while (candidate !== ownSlug && (await isTaken(candidate))) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}
