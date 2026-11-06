import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';

import { getItemById } from '@/features/wishlist/data/getItemById';
import { canViewItem } from '@/features/wishlist/data/visibility';
import { getCurrentUser } from '@/lib/auth-utils';
import { getItemImage } from '@/features/wishlist/utils/getItemImage';
import { getItemUrl } from '@/features/wishlist/utils/getItemUrl';
import ItemReservation from '@/features/wishlist/components/ItemReservation';
import { PrivateBadge } from '@/features/wishlist/components/PrivateBadge';
import PageHeader from '@/widgets/PageHeader/PageHeader';
import { Button } from '@/components/ui/button';
import { CardTape } from '@/features/wishlist/components/CardTape';
import { HandExternalLinkIcon } from '@/features/wishlist/components/HandIcons';
import {
  getItemStickers,
  stickerPillClass,
  PillIcon,
} from '@/features/wishlist/components/Sticker';
import { getCardLook } from '@/features/wishlist/utils/getCardLook';
import { formatBrand } from '@/features/wishlist/utils/formatBrand';
import { cn } from '@/lib/utils';
import { softCardClass } from '@/features/wishlist/styles';

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

  const [item, user] = await Promise.all([getItemById(id), getCurrentUser()]);
  // Don't leak a private item's title to guests through the page metadata.
  if (!item || !canViewItem(item, user?.isAdmin)) return { title: 'Gift not found' };

  return {
    title: `${item.title} | My Wishlist`,
    description: item.brand ? `Gift ${item.title} by ${item.brand}` : `Gift ${item.title}`,
  };
}

export default async function ItemPage({ params }: Props) {
  const { slug } = await params;

  const id = extractIdFromSlug(slug);
  if (!id) notFound();

  const [item, user] = await Promise.all([getItemById(id), getCurrentUser()]);
  if (!item || !canViewItem(item, user?.isAdmin)) notFound();

  // The slug is derived from the title, so after a rename old links redirect to the current URL.
  const itemUrl = getItemUrl(item);
  if (`/item/${slug}` !== itemUrl) {
    redirect(itemUrl);
  }

  const image = getItemImage(item);
  // Same tape, tilt and sticker colours as this gift's card on the list.
  const look = getCardLook(item.id);
  const stickers = getItemStickers(item.id);

  return (
    <>
      <PageHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2 md:py-14">
        {/* Item photo, as a taped card like on the list */}
        <div className={cn('@container relative self-start p-4', softCardClass, look.tilt)}>
          <CardTape look={look} />
          <div className="overflow-hidden rounded-3xl bg-white">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width:768px) 50vw, 100vw"
              className="h-auto w-full object-contain p-6"
              priority
            />
          </div>
        </div>

        {/* Details + reservation */}
        <div className="flex flex-col gap-10">
          <div>
            {item.isPrivate && <PrivateBadge className="mb-3" />}
            {item.brand && (
              <p className="font-secondary text-sm text-navy/60">{formatBrand(item.brand)}</p>
            )}
            <h1 className="font-secondary text-3xl leading-tight text-navy md:text-4xl">
              {item.title}
            </h1>
          </div>

          <ItemReservation
            id={String(item.id)}
            version={item.version || 1}
            status={item.status}
            bookedBy={item.bookedBy}
            sticker={stickers.book}
            actions={
              item.shopLink && (
                <Button asChild variant="outline" className={stickerPillClass}>
                  <a href={item.shopLink} target="_blank" rel="noopener noreferrer">
                    <PillIcon icon={HandExternalLinkIcon} sticker={stickers.link} />
                    View product
                  </a>
                </Button>
              )
            }
          />
        </div>
      </main>
    </>
  );
}
