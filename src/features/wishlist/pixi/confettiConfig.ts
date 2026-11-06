import type { Range } from '@/lib/random';

/** Velocities are pixels per frame at 60fps; drag is the share of speed kept per frame. */
export type PieceKind = {
  /** Pieces per pixel of screen width, clamped to `count`. */
  perPixel: number;
  count: Range;
  scale: Range;
  /** Launch speed out of the burst. */
  speed: Range;
  /** Half-width of the launch cone around straight up, in radians. */
  spread: number;
  gravity: number;
  drag: number;
  /** Fastest fall speed, so pieces drift instead of dropping like stones. */
  terminal: Range;
  lifeMs: Range;
  tints: readonly number[];
};

const GOLD = 0xf5c542;
const DEEP_GOLD = 0xe0a526;
const PALE_GOLD = 0xffe08a;
const SILVER = 0xe6ebf5;

// Sticker papers from Sticker.tsx plus gold.
const STICKER_TINTS = [0xf78fb0, 0x6b84c8, 0xe9e89a, 0xd48cc5, 0xffc9c4] as const;

// Paper confetti: a quick pop out of the button, then a fluttering fall.
export const CONFETTI: PieceKind = {
  perPixel: 0.08,
  count: [60, 120],
  scale: [0.7, 1.15],
  speed: [12, 26],
  spread: 1.05,
  gravity: 0.28,
  drag: 0.955,
  terminal: [2.6, 3.8],
  lifeMs: [2600, 3400],
  tints: [...STICKER_TINTS, ...STICKER_TINTS, GOLD, DEEP_GOLD],
};

// Metallic glitter: wider, lighter, slower fall so it hangs in the air and glints.
export const GLITTER: PieceKind = {
  perPixel: 0.14,
  count: [90, 200],
  scale: [0.45, 0.95],
  speed: [8, 24],
  spread: 1.35,
  gravity: 0.07,
  drag: 0.94,
  terminal: [0.9, 1.6],
  lifeMs: [2800, 4200],
  tints: [GOLD, GOLD, DEEP_GOLD, PALE_GOLD, SILVER, ...STICKER_TINTS],
};

/** Peak share of white mixed into a glitter piece when it catches the light. */
export const GLINT_STRENGTH = 0.85;
/** Higher means shorter, sharper glints. */
export const GLINT_SHARPNESS = 10;
export const GLINT_SPEED: Range = [0.006, 0.016];

export const FLIP_SPEED: Range = [0.008, 0.02];
export const SPIN: Range = [0.02, 0.12];
export const SWAY_AMPLITUDE: Range = [0.4, 1.4];
export const SWAY_SPEED: Range = [0.002, 0.005];

// Four-point sparkles that pop over the glitter.
export const SPARKLE_TINTS = [0xffffff, 0xffffff, PALE_GOLD] as const;
export const SPARKLE_SCALE: Range = [0.35, 0.8];
export const SPARKLE_LIFE_MS: Range = [280, 520];
/** Sparkles per second while the glitter is still flying. */
export const SPARKLES_PER_SECOND = 45;
export const SPARKLE_WINDOW_MS = 2600;

/** How long the tail of each piece's life fades out. */
export const FADE_OUT_MS = 700;
/** Fade for a burst cut short when the booking fails. */
export const CANCEL_FADE_MS = 250;
export const OFFSCREEN_MARGIN = 40;
