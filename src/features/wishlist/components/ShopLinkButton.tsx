import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandExternalLinkIcon } from './HandIcons';
import { stickerIconButtonClass, stickerIconClass, stickerInk, type StickerLook } from './Sticker';

// Icon-only link to the shop, as a die-cut sticker (cards, My gifts).
export function ShopLinkButton({ href, sticker }: { href: string; sticker: StickerLook }) {
  const t = useTranslations('wishlist');

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn(stickerIconButtonClass, 'hover:rotate-6')}
      style={stickerInk(sticker)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={t('openShopLink')}>
        <HandExternalLinkIcon className={stickerIconClass} sticker={sticker.paper} />
      </a>
    </Button>
  );
}
