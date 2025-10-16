import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

import { getSession } from '@/lib/auth-utils';
import { WishlistItem } from '@/features/wishlist/types';

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { itemId } = await req.json();
    if (!itemId) {
      return new NextResponse('Item ID is required', { status: 400 });
    }

    const wishlist = await kv.get<WishlistItem[]>('wishlist');
    if (!wishlist) {
      return new NextResponse('Wishlist not found', { status: 404 });
    }

    const itemIndex = wishlist.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      return new NextResponse('Item not found in wishlist', { status: 404 });
    }

    if (wishlist[itemIndex].isBooked) {
      return new NextResponse('Item is already booked', { status: 409 });
    }

    wishlist[itemIndex].isBooked = true;

    await kv.set('wishlist', wishlist);

    return NextResponse.json(wishlist[itemIndex], { status: 200 });
  } catch (error) {
    console.error('[BOOK_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
