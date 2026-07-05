'use client';

import { useState } from 'react';

import { adminItemsApi } from './api';
import { pageCount } from './pagination';
import type { WishlistItemBase } from '@/features/wishlist/types';
import type { Page, WishlistItemInput } from '@/lib/wishlist-db';

// 'new' = the create form is open; a string = that item id is being edited.
export type Editing = 'new' | string | null;

/**
 * Controller for the admin wishlist: owns paging + editing state and the
 * create/update/delete operations. Mutations that can fail validation
 * (create/update) throw, so the form can surface the message; delete errors
 * are captured into `error`.
 */
export function useWishlistAdmin(initialPage: Page<WishlistItemBase>) {
  const { pageSize } = initialPage;

  const [items, setItems] = useState(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [total, setTotal] = useState(initialPage.total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);

  async function goToPage(target: number) {
    setLoading(true);
    setError(null);
    setEditing(null);
    try {
      const data = await adminItemsApi.list(target, pageSize);
      setItems(data.items);
      setPage(data.page);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  }

  async function createItem(values: WishlistItemInput) {
    await adminItemsApi.create(values);
    // New items are appended, so they land on the (new) last page — go there.
    await goToPage(pageCount(total + 1, pageSize));
  }

  async function updateItem(id: string, values: WishlistItemInput) {
    const updated = await adminItemsApi.update(id, values);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    setEditing(null);
  }

  async function removeItem(item: WishlistItemBase) {
    if (!window.confirm(`Delete “${item.name}”? This can't be undone.`)) return;

    setError(null);
    try {
      await adminItemsApi.remove(item.id);
      // The count shrank; reload the current page, clamped in case it emptied.
      await goToPage(Math.min(page, pageCount(total - 1, pageSize)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  }

  return {
    items,
    page,
    total,
    pageSize,
    totalPages: pageCount(total, pageSize),
    loading,
    error,
    editing,
    startCreate: () => setEditing('new'),
    startEdit: (id: string) => setEditing(id),
    cancelEdit: () => setEditing(null),
    goToPage,
    createItem,
    updateItem,
    removeItem,
  };
}
