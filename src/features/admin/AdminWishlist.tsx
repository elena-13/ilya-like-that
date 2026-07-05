'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ItemForm from './ItemForm';
import type { WishlistItemBase } from '@/features/wishlist/types';
import type { WishlistItemInput } from '@/lib/wishlist-db';
import { paths } from '@/lib/paths';

// 'new' = the create form is open; a string = that item id is being edited.
type Editing = 'new' | string | null;

function toInput(item: WishlistItemBase): WishlistItemInput {
  return { brand: item.brand, name: item.name, image: item.image, link: item.link };
}

export default function AdminWishlist({ initialItems }: { initialItems: WishlistItemBase[] }) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);

  async function createItem(values: WishlistItemInput) {
    const res = await fetch('/api/admin/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Failed to add item');

    const created: WishlistItemBase = await res.json();
    setItems((prev) => [...prev, created]);
    setEditing(null);
  }

  async function saveItem(id: string, values: WishlistItemInput) {
    const res = await fetch(`/api/admin/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Failed to save item');

    const updated: WishlistItemBase = await res.json();
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    setEditing(null);
  }

  async function deleteItem(item: WishlistItemBase) {
    if (!window.confirm(`Delete “${item.name}”? This can't be undone.`)) return;

    setError(null);
    const res = await fetch(`/api/admin/items/${item.id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError((await res.text()) || 'Failed to delete item');
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== item.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy md:text-3xl">Manage wishlist</h1>
          <p className="text-sm text-navy/60">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button onClick={() => setEditing('new')} disabled={editing === 'new'}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {editing === 'new' && (
        <ItemForm submitLabel="Add item" onSubmit={createItem} onCancel={() => setEditing(null)} />
      )}

      <ul className="flex flex-col gap-3">
        {items.map((item) =>
          editing === item.id ? (
            <li key={item.id}>
              <ItemForm
                initialValues={toInput(item)}
                submitLabel="Save"
                onSubmit={(values) => saveItem(item.id, values)}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <li
              key={item.id}
              className="flex items-center gap-4 rounded-2xl bg-card p-3 ring-1 ring-black/5"
            >
              {/* Admin thumbnail: plain img avoids next/image remote-domain config
                  for arbitrary admin-supplied image URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs text-navy/60">{item.brand}</p>
                <p className="truncate font-bold text-navy">{item.name}</p>
                <div className="flex flex-wrap gap-x-3 text-xs text-navy/50">
                  <Link href={paths.item(item.slug, item.id)} className="hover:underline">
                    /{item.slug}
                  </Link>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    link
                  </a>
                </div>
              </div>

              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => setEditing(item.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${item.name}`}
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteItem(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
