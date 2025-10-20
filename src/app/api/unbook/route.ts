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

    // 3. Главная проверка безопасности:
    // Убеждаемся, что текущий пользователь — это тот, кто сделал бронь.
    if (!bookedByUserId || bookedByUserId !== currentUserId) {
      return new NextResponse('Forbidden: You did not book this item.', { status: 403 });
    }

    // 4. Если все проверки пройдены, удаляем поле из хеша
    // kv.hdel вернет 1, если поле было удалено, и 0, если его не существовало.
    await kv.hdel(BOOKINGS_KEY, itemId);

    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Booking cancelled.' }, { status: 200 });
  } catch (error) {
    console.error('[UNBOOK_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
