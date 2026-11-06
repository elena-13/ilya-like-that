import { Particle, type Texture } from 'pixi.js';

import { clamp, pickRandom, randomBetween, randomSign, type Range } from '@/lib/random';
import {
  FADE_OUT_MS,
  FLIP_SPEED,
  GLINT_SHARPNESS,
  GLINT_SPEED,
  GLINT_STRENGTH,
  SPARKLE_LIFE_MS,
  SPARKLE_SCALE,
  SPARKLE_TINTS,
  SPIN,
  SWAY_AMPLITUDE,
  SWAY_SPEED,
  type PieceKind,
} from './confettiConfig';

const FULL_TURN = Math.PI * 2;
const UP = -Math.PI / 2;

export type Point = { x: number; y: number };

export type Piece = {
  particle: Particle;
  look: 'paper' | 'glitter';
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  terminal: number;
  spin: number;
  flipSpeed: number;
  glintSpeed: number;
  swayAmplitude: number;
  swaySpeed: number;
  phase: number;
  scale: number;
  tint: number;
  /** Current glint, 0..1 (glitter only). */
  glint: number;
  ageMs: number;
  lifeMs: number;
};

export type Sparkle = {
  particle: Particle;
  scale: number;
  ageMs: number;
  lifeMs: number;
};

// Mixes `amount` (0..1) of `target` into `color`, channel by channel.
const mix = (color: number, target: number, amount: number) => {
  const channel = (shift: number) => {
    const from = (color >> shift) & 0xff;
    const to = (target >> shift) & 0xff;
    return Math.round(from + (to - from) * amount) << shift;
  };
  return channel(16) | channel(8) | channel(0);
};

const BLACK = 0x000000;
const WHITE = 0xffffff;

export function createPiece(
  texture: Texture,
  kind: PieceKind,
  look: Piece['look'],
  origin: Point,
): Piece {
  const angle = UP + randomBetween([-kind.spread, kind.spread]);
  // Squaring the roll keeps most pieces near the burst and flings a few far out.
  const speed = kind.speed[0] + (kind.speed[1] - kind.speed[0]) * Math.sqrt(Math.random());
  const scale = randomBetween(kind.scale);
  const tint = pickRandom(kind.tints);

  return {
    particle: new Particle({
      texture,
      x: origin.x,
      y: origin.y,
      scaleX: scale,
      scaleY: scale,
      anchorX: 0.5,
      anchorY: 0.5,
      rotation: Math.random() * FULL_TURN,
      tint,
    }),
    look,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    gravity: kind.gravity * randomBetween([0.8, 1.2]),
    drag: kind.drag,
    terminal: randomBetween(kind.terminal),
    spin: randomBetween(SPIN) * randomSign(),
    flipSpeed: randomBetween(FLIP_SPEED),
    glintSpeed: randomBetween(GLINT_SPEED),
    swayAmplitude: randomBetween(SWAY_AMPLITUDE),
    swaySpeed: randomBetween(SWAY_SPEED),
    phase: Math.random() * FULL_TURN,
    scale,
    tint,
    glint: 0,
    ageMs: 0,
    lifeMs: randomBetween(kind.lifeMs),
  };
}

/** Moves a piece one tick; returns false once it's done. */
export function updatePiece(piece: Piece, deltaTime: number, deltaMs: number, fade: number) {
  const { particle } = piece;
  piece.ageMs += deltaMs;

  const keep = piece.drag ** deltaTime;
  piece.vx *= keep;
  piece.vy = Math.min(piece.vy * keep + piece.gravity * deltaTime, piece.terminal);

  // Side-to-side drift grows in as the launch speed dies down.
  const settled = clamp(1 - Math.abs(piece.vy - piece.terminal) / piece.terminal, 0, 1);
  const sway =
    Math.sin(piece.ageMs * piece.swaySpeed + piece.phase) * piece.swayAmplitude * settled;

  particle.x += (piece.vx + sway) * deltaTime;
  particle.y += piece.vy * deltaTime;
  particle.rotation += piece.spin * deltaTime;

  const cycle =
    piece.ageMs * (piece.look === 'paper' ? piece.flipSpeed : piece.glintSpeed) + piece.phase;

  if (piece.look === 'paper') {
    // Tumbling paper: squash on one axis and darken when it turns edge-on.
    const flip = Math.cos(cycle);
    particle.scaleX = piece.scale;
    particle.scaleY = piece.scale * flip;
    particle.tint = mix(piece.tint, BLACK, (1 - Math.abs(flip)) * 0.35);
  } else {
    // Glitter: a short, sharp flash of white as the flake catches the light.
    const glint = Math.max(0, Math.sin(cycle)) ** GLINT_SHARPNESS;
    piece.glint = glint;
    const size = piece.scale * (0.85 + 0.45 * glint);
    particle.scaleX = size;
    particle.scaleY = size;
    particle.tint = mix(piece.tint, WHITE, glint * GLINT_STRENGTH);
  }

  const lifeLeft = piece.lifeMs - piece.ageMs;
  particle.alpha = clamp(lifeLeft / FADE_OUT_MS, 0, 1) * fade;

  return lifeLeft > 0 && fade > 0;
}

/** Glitter that is mid-glint right now: a good place for a sparkle. */
export const isGlinting = (piece: Piece) => piece.glint > 0.5;

export function createSparkle(texture: Texture, at: Point): Sparkle {
  const scale = randomBetween(SPARKLE_SCALE);
  return {
    particle: new Particle({
      texture,
      x: at.x,
      y: at.y,
      scaleX: 0,
      scaleY: 0,
      anchorX: 0.5,
      anchorY: 0.5,
      rotation: randomBetween([-0.3, 0.3] as Range),
      tint: pickRandom(SPARKLE_TINTS),
    }),
    scale,
    ageMs: 0,
    lifeMs: randomBetween(SPARKLE_LIFE_MS),
  };
}

/** Pops a sparkle in and out; returns false once it's done. */
export function updateSparkle(sparkle: Sparkle, deltaMs: number, fade: number) {
  sparkle.ageMs += deltaMs;
  const progress = clamp(sparkle.ageMs / sparkle.lifeMs, 0, 1);
  const size = sparkle.scale * Math.sin(progress * Math.PI);

  sparkle.particle.scaleX = size;
  sparkle.particle.scaleY = size;
  sparkle.particle.rotation += deltaMs * 0.002;
  sparkle.particle.alpha = fade;

  return progress < 1 && fade > 0;
}
