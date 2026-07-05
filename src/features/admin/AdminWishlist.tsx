'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ItemForm from './ItemForm';
import WishlistItemRow from './WishlistItemRow';
import PaginationControls from './PaginationControls';
import { useWishlistAdmin } from './useWishlistAdmin';
import type { WishlistItemBase } from '@/features/wishlist/types';
import type { Page, WishlistItemInput } from '@/lib/wishlist-db';

function toInput(item: WishlistItemBase): WishlistItemInput {
  return { brand: item.brand, name: item.name, image: item.image, link: item.link };
}

export default function AdminWishlist({ initialPage }: { initialPage: Page<WishlistItemBase> }) {
  const admin = useWishlistAdmin(initialPage);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy md:text-3xl">Manage wishlist</h1>
          <p className="text-sm text-navy/60">
            {admin.total} {admin.total === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button onClick={admin.startCreate} disabled={admin.editing === 'new'}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      {admin.error && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {admin.error}
        </p>
      )}

      {admin.editing === 'new' && (
        <ItemForm submitLabel="Add item" onSubmit={admin.createItem} onCancel={admin.cancelEdit} />
      )}

      <ul
        className="flex flex-col gap-3"
        aria-busy={admin.loading}
        style={{ opacity: admin.loading ? 0.6 : 1 }}
      >
        {admin.items.map((item) =>
          admin.editing === item.id ? (
            <li key={item.id}>
              <ItemForm
                initialValues={toInput(item)}
                submitLabel="Save"
                onSubmit={(values) => admin.updateItem(item.id, values)}
                onCancel={admin.cancelEdit}
              />
            </li>
          ) : (
            <WishlistItemRow
              key={item.id}
              item={item}
              onEdit={() => admin.startEdit(item.id)}
              onDelete={() => admin.removeItem(item)}
            />
          ),
        )}
      </ul>

      {admin.items.length === 0 && !admin.loading && (
        <p className="rounded-2xl bg-card p-6 text-center text-sm text-navy/60 ring-1 ring-black/5">
          No items yet. Click “Add item” to create one.
        </p>
      )}

      <PaginationControls
        page={admin.page}
        totalPages={admin.totalPages}
        disabled={admin.loading}
        onChange={admin.goToPage}
      />
    </div>
  );
}
