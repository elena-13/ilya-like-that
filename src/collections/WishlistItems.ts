import type { CollectionConfig } from 'payload';

export const WishlistItems: CollectionConfig = {
  slug: 'wishlist-items',
  labels: {
    singular: 'Wishlist item',
    plural: 'Wishlist items',
  },
  admin: {
    // Show gifts by their title in the admin panel.
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'shopLink'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Gift title',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Booked', value: 'booked' },
      ],
      defaultValue: 'available',
    },
    {
      name: 'version',
      type: 'number',
      label: 'Version (prevents double booking)',
      defaultValue: 1,
      admin: {
        // Managed by the booking action; read-only so it can't be changed by accident.
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'shopLink',
      type: 'text',
      label: 'Shop link (where to buy)',
    },
  ],
};
