import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandExternalLinkIcon } from './HandIcons';
import { stickerIconButtonClass, stickerInk, type StickerLook } from './Sticker';

// Icon-only link to the shop, as a die-cut sticker (cards, My gifts).
export function ShopLinkButton({ href, sticker }: { href: string; sticker: StickerLook }) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn(stickerIconButtonClass, 'hover:rotate-6')}
      style={stickerInk(sticker)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Open external link">
        <HandExternalLinkIcon className="size-10" sticker={sticker.paper} />
      </a>
    </Button>
  );
}
