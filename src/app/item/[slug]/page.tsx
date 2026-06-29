import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

import wishlistData from '@/features/wishlist/data/wishlist.json';
import { getItemById } from '@/features/wishlist/data/getItemById';
import { paths } from '@/lib/paths';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Helper function to keep our component code clean and DRY.
 * Safely extracts the ID from a hybrid slug (e.g., "dyson-v15-p123").
 */
function extractIdFromSlug(fullSlug: string): string | null {
  const separatorIndex = fullSlug.lastIndexOf('-p');
  if (separatorIndex === -1) return null;

  return fullSlug.substring(separatorIndex + 2);
}

// FIX: generateStaticParams must return the exact param key ('slug')
// formatted exactly as it will appear in the URL.
export function generateStaticParams() {
  return wishlistData.map((item) => ({
    slug: `${item.slug}-p${item.id}`,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params for Next.js 15 compatibility
  const { slug } = await params;

  const id = extractIdFromSlug(slug);
  if (!id) return { title: 'Gift not found' };

  const item = await getItemById(id);
  if (!item) return { title: 'Gift not found' };

  return {
    title: `${item.name} | My Wishlist`,
    description: `Gift ${item.name} by ${item.brand}`,
    openGraph: {
      images: [item.image],
    },
  };
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;

  const id = extractIdFromSlug(slug);
  if (!id) notFound();

  const item = await getItemById(id);
  if (!item) notFound();

  // SEO & UX protection: if the slug is outdated, gracefully redirect
  const correctSlug = `${item.slug}-p${item.id}`;
  if (slug !== correctSlug) {
    redirect(paths.item(item.slug, item.id));
  }

  return (
    <div>
      <h1>{item.name}</h1>
      <p>This is the item page.</p>
    </div>
  );
}
