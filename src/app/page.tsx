import WishlistList from '@/features/wishlist/components/WishlistList';
import wishlistData from '@/features/wishlist/data/wishlist.json';
import { WishlistItem } from '@/features/wishlist/types';

function getWishlistItems(): WishlistItem[] {
  // В будущем здесь будет запрос к Vercel KV
  return wishlistData;
}

export default function Home() {
  const items = getWishlistItems();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Ilya Like That! 🎁</h1>
        <p className="mt-4 text-lg text-gray-600">A little wishlist for a little human.</p>
      </div>

      <WishlistList items={items} />
    </div>
  );
}
