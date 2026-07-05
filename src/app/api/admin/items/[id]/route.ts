import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth-utils';
import { removeItem, updateItem } from '@/lib/wishlist-db';
import { parseUpdateInput } from '@/features/wishlist/validation';
import { paths } from '@/lib/paths';

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/admin/items/:id — update an item (admin only). */
export async function PATCH(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  const parsed = parseUpdateInput(body);
  if (!parsed.ok) {
    return new NextResponse(parsed.error, { status: 400 });
  }

  const item = await updateItem(id, parsed.data);
  if (!item) {
    return new NextResponse('Item not found', { status: 404 });
  }

  revalidatePath('/');
  revalidatePath(paths.item(item.slug, item.id));

  return NextResponse.json(item);
}

/** DELETE /api/admin/items/:id — delete an item (admin only). */
export async function DELETE(request: Request, { params }: RouteContext) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  const removed = await removeItem(id);
  if (!removed) {
    return new NextResponse('Item not found', { status: 404 });
  }

  revalidatePath('/');

  return new NextResponse(null, { status: 204 });
}
