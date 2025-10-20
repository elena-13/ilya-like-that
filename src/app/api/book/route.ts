import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

import { BOOKINGS_KEY } from '@/features/wishlist/constants';
import { getSession } from '@/lib/auth-utils';

/**
 * POST /api/book
 * Body: { itemId: string }
 * Logic: set booking only if not already set (atomic).
 */
export async function POST(req: Request) {
  try {
    // 1) Auth check
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2) Parse + validate input
    const { itemId } = await req.json();
    if (typeof itemId !== 'string' || !itemId.trim()) {
      return new NextResponse('Item ID is required', { status: 400 });
    }

    // 3) Normalize user id (ensure string)
    const userId = String(session.user.id);

    // 4) Atomic write: set only if not exists
    // Returns 1 if written, 0 if field already exists
    const wrote = await kv.hsetnx(BOOKINGS_KEY, itemId, userId);

    if (wrote === 0) {
      // Already booked by someone else
      return new NextResponse('Item is already booked', { status: 409 });
    }

    // 5) OK
    return NextResponse.json({ success: true, itemId, bookedBy: userId });
  } catch (err) {
    // Avoid leaking internals in responses, log server-side only
    console.error('[BOOK_POST]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
