'use client';

import { useEffect, useRef } from 'react';
import type { ApplicationOptions } from 'pixi.js';

import { usePixiScene } from '@/lib/pixi/usePixiScene';
import { createConfettiBurst } from '../pixi/createConfettiBurst';
import type { BurstOrigin } from '../utils/giftBookedEvent';

const MAX_RESOLUTION = 2;

const getPixiOptions = (): Partial<ApplicationOptions> => ({
  backgroundAlpha: 0,
  resizeTo: window,
  antialias: true,
  autoDensity: true,
  resolution: Math.min(window.devicePixelRatio, MAX_RESOLUTION),
  autoStart: false,
});

export type BurstRequest = { id: number; origin?: BurstOrigin };

type ConfettiProps = {
  burst: BurstRequest | null;
  cancelCount: number;
};

export function Confetti({ burst, cancelCount }: ConfettiProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const confetti = usePixiScene(hostRef, getPixiOptions, createConfettiBurst);
  const playedIdRef = useRef(0);

  useEffect(() => {
    // A burst requested while Pixi was still starting plays as soon as it's ready.
    if (confetti && burst && burst.id !== playedIdRef.current) {
      playedIdRef.current = burst.id;
      confetti.play(burst.origin);
    }
  }, [confetti, burst]);

  useEffect(() => {
    if (confetti && cancelCount > 0) confetti.cancel();
  }, [confetti, cancelCount]);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-100" />;
}
