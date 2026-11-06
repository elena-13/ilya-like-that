import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandExternalLinkIcon } from './HandIcons';
import { compactPillClass, PillIcon, stickerPillClass, type StickerLook } from './Sticker';

type ShopLinkPillProps = {
  href: string;
  sticker: StickerLook;
  // Smaller pill for My gifts rows.
  compact?: boolean;
  className?: string;
};

// "View in the shop": labelled outlined pill with the link sticker
// (item page and My gifts). Cards use the icon-only ShopLinkButton.
export function ShopLinkPill({ href, sticker, compact = false, className }: ShopLinkPillProps) {
  const t = useTranslations('wishlist');

  return (
    <Button
      asChild
      variant="outline"
      className={cn(stickerPillClass, compact && compactPillClass, className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <PillIcon
          icon={HandExternalLinkIcon}
          sticker={sticker}
          className={compact ? 'size-7' : undefined}
        />
        {t('viewInShop')}
      </a>
    </Button>
  );
}
