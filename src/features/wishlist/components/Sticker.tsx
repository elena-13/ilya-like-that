import type { CSSProperties } from 'react';

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
export const stickerPillIconClass =
  'transition-transform duration-300 group-hover/pill:scale-110 group-hover/pill:rotate-6';
