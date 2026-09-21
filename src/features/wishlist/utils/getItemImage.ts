import type { WishlistItem } from '@/payload-types';

const FALLBACK_IMAGE = {
  src: '/images/fallback.webp',
  width: 800,
  height: 1200,
};

// Resolves the gift's uploaded image, falling back to the placeholder
// when there is no image or the relation wasn't populated (depth 0).
export function getItemImage(item: WishlistItem) {
  const { image } = item;

  if (!image || typeof image !== 'object' || !image.url) {
    return { ...FALLBACK_IMAGE, alt: item.title };
  }

  return {
    src: image.url,
    width: image.width ?? FALLBACK_IMAGE.width,
    height: image.height ?? FALLBACK_IMAGE.height,
    alt: image.alt || item.title,
  };
}
