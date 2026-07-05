import type { WishlistItemInput } from '@/lib/wishlist-db';

export type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

const MAX_LEN = 200;

const FIELDS = ['brand', 'name', 'image', 'link'] as const;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Per-field rule applied to a trimmed, non-empty string.
const RULES: Record<(typeof FIELDS)[number], (v: string) => boolean> = {
  brand: (v) => v.length <= MAX_LEN,
  name: (v) => v.length <= MAX_LEN,
  // A local /public path or an absolute http(s) URL.
  image: (v) => v.startsWith('/') || isHttpUrl(v),
  link: (v) => isHttpUrl(v),
};

/**
 * Validate a request body into wishlist item fields.
 * `partial: true` allows a subset (for PATCH) but requires at least one field;
 * otherwise every field is required (for POST).
 */
function parseFields(
  body: unknown,
  { partial }: { partial: boolean },
): Parsed<Partial<WishlistItemInput>> {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const record = body as Record<string, unknown>;
  const data: Partial<WishlistItemInput> = {};

  for (const field of FIELDS) {
    const raw = record[field];

    if (raw === undefined) {
      if (partial) continue;
      return { ok: false, error: `${field} is required` };
    }
    if (typeof raw !== 'string') {
      return { ok: false, error: `${field} must be a string` };
    }

    const value = raw.trim();
    if (value.length === 0) {
      return { ok: false, error: `${field} must not be empty` };
    }
    if (!RULES[field](value)) {
      return { ok: false, error: `${field} is invalid` };
    }
    data[field] = value;
  }

  if (partial && Object.keys(data).length === 0) {
    return { ok: false, error: 'No fields to update' };
  }

  return { ok: true, data };
}

export function parseCreateInput(body: unknown): Parsed<WishlistItemInput> {
  const result = parseFields(body, { partial: false });
  // Not partial => every field is present.
  return result.ok ? { ok: true, data: result.data as WishlistItemInput } : result;
}

export function parseUpdateInput(body: unknown): Parsed<Partial<WishlistItemInput>> {
  return parseFields(body, { partial: true });
}
