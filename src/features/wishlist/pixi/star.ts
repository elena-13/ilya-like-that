import { Particle, type Texture } from 'pixi.js';

import { pickRandom, pickWeighted, randomBetween, randomSign } from '@/lib/random';
import {
  LAYERS,
  MIN_TWINKLE_ALPHA,
  OFFSCREEN_MARGIN,
  SPIN,
  SWAY_AMPLITUDE,
  SWAY_SPEED,
  TINTS,
  TWINKLE_SPEED,
} from './starShowerConfig';

const FULL_TURN = Math.PI * 2;

export type Star = {
  particle: Particle;
  baseX: number;
  speed: number;
  spin: number;
  swayAmplitude: number;
  swaySpeed: number;
  twinkleSpeed: number;
  phase: number;
};

export function createStar(texture: Texture, screenWidth: number): Star {
  const layer = pickWeighted(LAYERS);
  const scale = randomBetween(layer.scale);
  const baseX = Math.random() * screenWidth;

  return {
    particle: new Particle({
      texture,
      x: baseX,
      y: -OFFSCREEN_MARGIN * (1 + Math.random()),
      scaleX: scale,
      scaleY: scale,
      anchorX: 0.5,
      anchorY: 0.5,
      rotation: Math.random() * FULL_TURN,
      tint: pickRandom(TINTS),
    }),
    baseX,
    speed: randomBetween(layer.speed),
    spin: randomBetween(SPIN) * randomSign(),
    swayAmplitude: randomBetween(SWAY_AMPLITUDE),
    swaySpeed: randomBetween(SWAY_SPEED),
    twinkleSpeed: randomBetween(TWINKLE_SPEED),
    phase: Math.random() * FULL_TURN,
  };
}

export function updateStar(star: Star, deltaTime: number, elapsedMs: number, fade: number) {
  const { particle } = star;

  particle.y += star.speed * deltaTime;
  particle.rotation += star.spin * deltaTime;
  particle.x = star.baseX + Math.sin(elapsedMs * star.swaySpeed + star.phase) * star.swayAmplitude;

  const twinkle = (1 + Math.sin(elapsedMs * star.twinkleSpeed + star.phase)) / 2;
  particle.alpha = (MIN_TWINKLE_ALPHA + (1 - MIN_TWINKLE_ALPHA) * twinkle) * fade;
}
