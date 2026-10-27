'use client';

import { useRef } from 'react';
import type { ApplicationOptions } from 'pixi.js';

import { usePixiApp } from '@/lib/pixi/usePixiApp';

// Retina screens report 3x; capping at 2 looks the same and saves battery.
const MAX_RESOLUTION = 2;

const getPixiOptions = (): Partial<ApplicationOptions> => ({
  backgroundAlpha: 0,
  resizeTo: window,
  antialias: true,
  autoDensity: true,
  resolution: Math.min(window.devicePixelRatio, MAX_RESOLUTION),
});

export function StarShower() {
  const hostRef = useRef<HTMLDivElement>(null);

  usePixiApp(hostRef, getPixiOptions);

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-100" />;
}
