import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

import { getItemById } from '@/features/wishlist/data/getItemById';
import ItemReservation from '@/features/wishlist/components/ItemReservation';
import PageHeader from '@/widgets/PageHeader/PageHeader';
import { Button } from '@/components/ui/button';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Helper function to keep our component code clean and DRY.
 * Safely extracts the numeric Payload ID from a hybrid slug (e.g., "dyson-v15-p123").
 */
function extractIdFromSlug(fullSlug: string): string | null {
  const match = fullSlug.match(/-p(\d+)$/);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params for Next.js 15 compatibility
  const { slug } = await params;

  const id = extractIdFromSlug(slug);
  if (!id) return { title: 'Gift not found' };

  const item = await getItemById(id);
  if (!item) return { title: 'Gift not found' };

  return {
    title: `${item.title} | My Wishlist`,
    description: `Gift ${item.title}`,
  };
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;

  const id = extractIdFromSlug(slug);
  if (!id) notFound();

  const item = await getItemById(id);
  if (!item) notFound();

  return (
    <>
      <PageHeader />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2 md:py-12">
        {/* Item image */}
        <div className="overflow-hidden rounded-4xl bg-white ring-1 ring-black/5 shadow-sm">
          <Image
            src="/images/image-22.webp"
            alt={item.title}
            width={800}
            height={1200}
            sizes="(min-width:768px) 50vw, 100vw"
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        {/* Details + reservation */}
        <div className="flex flex-col gap-5">
          <h1 className="text-2xl font-bold leading-snug text-navy md:text-3xl">{item.title}</h1>

          {item.shopLink && (
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={item.shopLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View product
              </a>
            </Button>
          )}

          <ItemReservation
            id={String(item.id)}
            version={item.version || 1}
            status={item.status}
            bookedBy={item.bookedBy}
          />
        </div>
      </main>
    </>
  );
}
