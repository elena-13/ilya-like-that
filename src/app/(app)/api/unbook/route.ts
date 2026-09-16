import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

import { BOOKINGS_KEY } from '@/features/wishlist/constants';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/unbook
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
    const currentUserId = String(session.user.id);

    const bookedByUserId = await kv.hget<string>(BOOKINGS_KEY, itemId);

    // 4) Main security check:
    // make sure the current user is the one who made the booking.
    if (!bookedByUserId || bookedByUserId !== currentUserId) {
      return new NextResponse('Forbidden: You did not book this item.', { status: 403 });
    }

    // 5) All checks passed, remove the field from the hash.
    // kv.hdel returns 1 if the field was removed and 0 if it didn't exist.
    await kv.hdel(BOOKINGS_KEY, itemId);

    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Booking cancelled.' }, { status: 200 });
  } catch (error) {
    console.error('[UNBOOK_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
