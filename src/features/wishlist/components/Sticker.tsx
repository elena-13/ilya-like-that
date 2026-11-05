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
