import WishlistItemCard from './WishlistItemCard';

import { WishlistItem } from '../types';
import { WishlistEmptyState } from './WishlistEmptyState';

type WishlistListProps = {
  items: WishlistItem[];
};

export default function WishlistList({ items }: WishlistListProps) {
  return (
    <div>
      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <WishlistEmptyState />
      )}
    </div>
  );
}
