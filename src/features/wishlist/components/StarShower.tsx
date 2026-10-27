'use client';

import { useEffect, useRef } from 'react';
import type { ApplicationOptions } from 'pixi.js';

import { usePixiScene } from '@/lib/pixi/usePixiScene';
import { createStarShower } from '../pixi/createStarShower';

const MAX_RESOLUTION = 2;

const getPixiOptions = (): Partial<ApplicationOptions> => ({
  backgroundAlpha: 0,
  resizeTo: window,
  antialias: true,
  autoDensity: true,
  resolution: Math.min(window.devicePixelRatio, MAX_RESOLUTION),
  autoStart: false,
});

type StarShowerProps = {
  playCount: number;
};

export function StarShower({ playCount }: StarShowerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shower = usePixiScene(hostRef, getPixiOptions, createStarShower);

  useEffect(() => {
    if (shower && playCount > 0) {
      shower.play();
    }
  }, [shower, playCount]);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-100" />;
}
