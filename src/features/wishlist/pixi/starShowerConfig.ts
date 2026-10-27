import type { Range } from '@/lib/random';

export type Layer = {
  weight: number;
  scale: Range;
  /** Pixels per frame at 60fps. */
  speed: Range;
};

// Small far stars fall slowly, big near ones fast, like the header's StarsField.
export const LAYERS: Layer[] = [
  { weight: 0.5, scale: [0.12, 0.2], speed: [2.5, 3.5] },
  { weight: 0.3, scale: [0.2, 0.32], speed: [4, 5.5] },
  { weight: 0.2, scale: [0.32, 0.5], speed: [6, 8] },
];

// Mostly white, plus yellow, pink and peach from globals.css.
export const TINTS = [0xffffff, 0xffffff, 0xffffff, 0xffffff, 0xffbf00, 0xffa5f2, 0xffab77];

export const STARS_PER_PIXEL_OF_WIDTH = 0.1;
export const MIN_STARS = 40;
export const MAX_STARS = 160;

export const SPAWN_MS = 1200;
export const FADE_START_MS = 2600;
export const FADE_MS = 900;
export const OFFSCREEN_MARGIN = 40;

export const SPIN: Range = [0.01, 0.04];
export const SWAY_AMPLITUDE: Range = [10, 30];
export const SWAY_SPEED: Range = [0.002, 0.004];
export const TWINKLE_SPEED: Range = [0.004, 0.01];
export const MIN_TWINKLE_ALPHA = 0.4;
