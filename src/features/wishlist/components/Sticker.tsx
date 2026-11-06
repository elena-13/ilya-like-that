import type { ComponentType, CSSProperties } from 'react';

import { cn } from '@/lib/utils';
import type { HandIconProps } from './HandIcons';

import { hash } from '../utils/getCardLook';

// Die-cut stickers for the card icons: a flat colour outline that follows
// the icon's shape, with the icon drawn in a contrasting colour on top.

// Sticker colour + ink colour pairs.
const PALETTE = [
  { paper: '#f78fb0', ink: '#7a1e3a' }, // pink / maroon
  { paper: '#ffc9c4', ink: '#c7581c' }, // blush / burnt orange
  { paper: '#d0571b', ink: '#f9a0bf' }, // burnt orange / pink
  { paper: '#4f4b12', ink: '#e9ea8f' }, // olive / pale lime
  { paper: '#e9e89a', ink: '#7a1e3a' }, // pale lime / maroon
  { paper: '#d48cc5', ink: '#4f4b12' }, // orchid / olive
  { paper: '#6b84c8', ink: '#f6efe2' }, // periwinkle / cream
];

export type StickerLook = {
  paper: string;
  ink: string;
};

// Picks a sticker from a seed (item id + which button), so each card gets
// its own mix and keeps it between renders.
export function getStickerLook(seed: string): StickerLook {
  return PALETTE[hash(seed) % PALETTE.length];
}

// The two stickers a gift uses everywhere (card, item page, My gifts), so
// its link and gift icons keep the same colours on every page.
export function getItemStickers(id: string | number) {
  return {
    link: getStickerLook(`${id}-link`),
    book: getStickerLook(`${id}-book`),
  };
}

// Colours the button's icon with the sticker ink.
export function stickerInk(look: StickerLook): CSSProperties {
  return { color: look.ink };
}

// Default sticker for buttons that aren't tied to a card.
export const DEFAULT_STICKER: StickerLook = { paper: '#f78fb0', ink: '#7a1e3a' };

// Outlined navy pill for labelled buttons with a sticker icon
// (Log in, Cancel booking). Tilts a little and fills on hover.
export const stickerPillClass = `
  group/pill h-11 cursor-pointer gap-2 rounded-full border-2 border-navy bg-transparent
  pl-2 pr-5 font-secondary text-base text-navy shadow-none
  transition-[background-color,rotate,scale] duration-300
  hover:-rotate-2 hover:bg-background hover:text-navy
  dark:border-navy dark:bg-transparent dark:hover:bg-background
`;

// Wrapper for the icon inside a sticker pill: ink colour + hover wiggle.
const stickerPillIconClass =
  'transition-transform duration-300 group-hover/pill:scale-110 group-hover/pill:rotate-6';

// Icon inside a sticker pill, in the sticker's colours.
export function PillIcon({
  icon: Icon,
  sticker,
  className = 'size-8',
}: {
  icon: ComponentType<HandIconProps>;
  sticker: StickerLook;
  className?: string;
}) {
  return (
    <span className={stickerPillIconClass} style={stickerInk(sticker)}>
      <Icon className={className} sticker={sticker.paper} />
    </span>
  );
}

// Icon-only sticker button (Book, shop link on cards): no fill, the
// sticker grows and turns a little on hover.
export const stickerIconButtonClass = cn(
  'relative size-10 cursor-pointer bg-transparent hover:scale-110 hover:bg-transparent',
  'dark:hover:bg-transparent',
);
