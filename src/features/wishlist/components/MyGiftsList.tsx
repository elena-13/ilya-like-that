import Image from 'next/image';
import { useTranslations } from 'next-intl';

import type { WishlistItem } from '@/payload-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { paths } from '@/lib/paths';
import { HandGiftIcon } from './HandIcons';
import { DEFAULT_STICKER, getItemStickers, PillIcon, stickerPillClass } from './Sticker';
import { ShopLinkPill } from './ShopLinkPill';
import { UnbookButton } from './UnbookButton';
import { softCardClass } from '../styles';
import { formatBrand } from '../utils/formatBrand';
import { getItemImage } from '../utils/getItemImage';
import { getItemUrl } from '../utils/getItemUrl';

type MyGiftsListProps = {
  items: WishlistItem[];
};

export default function MyGiftsList({ items }: MyGiftsListProps) {
  const t = useTranslations('myGifts');

  if (items.length === 0) {
    return (
      <div className={cn(softCardClass, 'flex flex-col items-center gap-2 p-10 text-center')}>
        <span style={{ color: DEFAULT_STICKER.ink }}>
          <HandGiftIcon className="size-14" sticker={DEFAULT_STICKER.paper} />
        </span>
        <h2 className="mt-2 font-secondary text-xl text-navy">
          {t('emptyTitle')}
        </h2>
        <p className="text-navy/60">{t('emptyText')}</p>
        <Button asChild variant="outline" className={cn(stickerPillClass, 'mt-5')}>
          <Link href={paths.home()}>
            <PillIcon icon={HandGiftIcon} sticker={DEFAULT_STICKER} />
            {t('browse')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {items.map((item) => (
        <MyGiftRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

function MyGiftRow({ item }: { item: WishlistItem }) {
  const image = getItemImage(item);
  const itemUrl = getItemUrl(item);
  // Same sticker colours as this gift's icons on the list.
  const stickers = getItemStickers(item.id);

  return (
    <li className={cn(softCardClass, 'flex flex-wrap items-center gap-4 p-3 pr-4 sm:flex-nowrap')}>
      <Link href={itemUrl} className="shrink-0 overflow-hidden rounded-3xl bg-white">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="96px"
          className="h-20 w-20 object-contain p-1.5 sm:h-24 sm:w-24"
        />
      </Link>

      <div className="min-w-0 flex-1">
        {item.brand && (
          <p className="font-secondary text-xs text-navy/60">{formatBrand(item.brand)}</p>
        )}
        <h2 className="font-secondary text-lg leading-snug text-navy line-clamp-2">
          <Link href={itemUrl} className="hover:underline">
            {item.title}
          </Link>
        </h2>
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
        {item.shopLink && <ShopLinkPill href={item.shopLink} sticker={stickers.link} compact />}
        <UnbookButton id={String(item.id)} sticker={stickers.book} compact />
      </div>
    </li>
  );
}
