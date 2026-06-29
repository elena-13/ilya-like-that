import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

import wishlistData from '@/features/wishlist/data/wishlist.json';
import { getItemById } from '@/features/wishlist/data/getItemById';
import ItemReservation from '@/features/wishlist/components/ItemReservation';
import PageHeader from '@/widgets/PageHeader/PageHeader';
import { Button } from '@/components/ui/button';
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
    <>
      <PageHeader />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2 md:py-12">
        {/* Item image */}
        <div className="overflow-hidden rounded-4xl bg-white ring-1 ring-black/5 shadow-sm">
          <Image
            src={item.image}
            alt={item.name}
            width={800}
            height={1200}
            sizes="(min-width:768px) 50vw, 100vw"
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        {/* Details + reservation */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="font-secondary text-sm text-navy/60">{item.brand}</p>
            <h1 className="text-2xl font-bold leading-snug text-navy md:text-3xl">{item.name}</h1>
          </div>

          {item.link && (
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View product
              </a>
            </Button>
          )}

          <ItemReservation itemId={item.id} isBooked={item.isBooked} bookedBy={item.bookedBy} />
        </div>
      </main>
    </>
  );
}
