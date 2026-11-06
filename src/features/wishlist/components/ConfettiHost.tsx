'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { onGiftBooked, onGiftBookingFailed } from '../utils/giftBookedEvent';
import type { BurstRequest } from './Confetti';

// Pixi stays out of the initial bundle; it's loaded when the browser is idle.
const Confetti = dynamic(() => import('./Confetti').then((mod) => mod.Confetti), {
  ssr: false,
});

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const IDLE_FALLBACK_MS = 1500;

const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

export function ConfettiHost() {
  const [isWarm, setIsWarm] = useState(false);
  const [burst, setBurst] = useState<BurstRequest | null>(null);
  const [cancelCount, setCancelCount] = useState(0);

  // Warm Pixi up once the page settles, so the first booking bursts without
  // waiting on a chunk download and WebGL setup.
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const warm = () => setIsWarm(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: IDLE_FALLBACK_MS * 2 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, IDLE_FALLBACK_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(
    () =>
      onGiftBooked((origin) => {
        if (prefersReducedMotion()) return;
        setIsWarm(true);
        setBurst((previous) => ({ id: (previous?.id ?? 0) + 1, origin }));
      }),
    [],
  );

  useEffect(() => onGiftBookingFailed(() => setCancelCount((count) => count + 1)), []);

  if (!isWarm) return null;

  return <Confetti burst={burst} cancelCount={cancelCount} />;
}
