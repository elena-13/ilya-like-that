import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    // Images are shown on the public wishlist, so anyone (including guests) can read them.
    read: () => true,
  },
  upload: {
    // Relative to the process cwd (project root locally, /app in Docker).
    staticDir: 'media',
    mimeTypes: ['image/*'],
    // Cropping and focal point need sharp, which isn't configured.
    crop: false,
    focalPoint: false,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt text',
    },
  ],
};
