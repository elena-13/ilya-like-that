import { kv } from '@vercel/kv';
import wishlistData from './wishlist.json';
import { WISHLIST_KEY } from '@/features/wishlist/constants';
import { LocalWishlistItem } from '../../../../scripts/sync';

export async function getItemById(id: string) {
  const baseItem = wishlistData.find((item) => item.id === id);

  if (!baseItem) {
    return null; // Возвращаем null, чтобы страница поняла, что нужно показать 404
  }

  // 2. Идем в Redis только за актуальным состоянием
  // В идеале в проде мы запрашиваем не весь массив, а используем Hash в Redis (hget),
  // но пока работаем с вашим текущим массивом:
  const currentData = await kv.get<LocalWishlistItem[]>(WISHLIST_KEY);
  const kvItem = currentData?.find((item) => item.id === id);

  // 3. Склеиваем
  return {
    ...baseItem,
    isBooked: kvItem?.isBooked ?? false,
    bookedBy: kvItem?.bookedBy ?? null,
  };
}
