import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { paths } from '@/lib/paths';
import { UnbookButton } from './UnbookButton';
import { getItemImage } from '../utils/getItemImage';
import { getItemUrl } from '../utils/getItemUrl';

type MyGiftsListProps = {
  items: WishlistItem[];
};

export default function MyGiftsList({ items }: MyGiftsListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center bg-white/50">
        <h2 className="text-lg font-semibold text-gray-900">You haven&apos;t booked any gifts yet</h2>
        <p className="mt-1 text-gray-500">Pick something from the wishlist and it will show up here.</p>
        <Button asChild className="mt-6 bg-navy text-white cursor-pointer">
          <Link href={paths.home()}>Browse the wishlist</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <MyGiftRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

function MyGiftRow({ item }: { item: WishlistItem }) {
  const image = getItemImage(item);
  const itemUrl = getItemUrl(item);

  return (
    <li className="flex items-center gap-4 rounded-3xl bg-white p-3 ring-1 ring-black/5 shadow-sm">
      <Link href={itemUrl} className="shrink-0 overflow-hidden rounded-2xl">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="96px"
          className="h-20 w-20 object-cover sm:h-24 sm:w-24"
        />
      </Link>

      <div className="min-w-0 grow">
        {item.brand && <p className="font-secondary text-xs text-navy/60">{item.brand}</p>}
        <h2 className="text-navy font-bold leading-snug line-clamp-2">
          <Link href={itemUrl} className="hover:underline">
            {item.title}
          </Link>
        </h2>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        {item.shopLink && (
          <Button asChild variant="secondary" size="sm" className="cursor-pointer">
            <a
              href={item.shopLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open external link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        <UnbookButton id={String(item.id)} />
      </div>
    </li>
  );
}
