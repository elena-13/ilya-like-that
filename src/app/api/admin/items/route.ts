import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth-utils';
import { addItem, getWishlistPage } from '@/lib/wishlist-db';
import { parseCreateInput } from '@/features/wishlist/validation';
import { parsePageParams } from '@/features/admin/pagination';

/** GET /api/admin/items?page&pageSize — one page of items (admin only). */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parsePageParams(searchParams);

  return NextResponse.json(await getWishlistPage(page, pageSize));
}

/** POST /api/admin/items — create an item (admin only). */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  const parsed = parseCreateInput(body);
  if (!parsed.ok) {
    return new NextResponse(parsed.error, { status: 400 });
  }

  const item = await addItem(parsed.data);
  revalidatePath('/'); // wishlist home reflects the new item

  return NextResponse.json(item, { status: 201 });
}
