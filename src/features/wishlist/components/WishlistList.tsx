import WishlistItemCard from './WishlistItemCard';

// import { WishlistItem } from '../types';
import type { WishlistItem } from '@/payload-types';
import { WishlistEmptyState } from './WishlistEmptyState';
import { mixOrder } from '../utils/mixOrder';

type WishlistListProps = {
  items: WishlistItem[];
};

export default function WishlistList({ items }: WishlistListProps) {
  return (
    <>
      {items.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-4 gap-8 pt-4 [column-fill:_balance]">
          {mixOrder(items).map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <WishlistEmptyState />
      )}
    </>
  );
}
