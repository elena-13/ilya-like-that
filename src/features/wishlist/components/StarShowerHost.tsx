'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

import { onGiftBooked } from '../utils/giftBookedEvent';

// Loaded on the first booking, so Pixi stays out of the initial bundle.
const StarShower = dynamic(() => import('./StarShower').then((mod) => mod.StarShower), {
  ssr: false,
});

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function StarShowerHost() {
  const [playCount, setPlayCount] = useState(0);

  useEffect(
    () =>
      onGiftBooked(() => {
        if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
        setPlayCount((count) => count + 1);
      }),
    [],
  );

  if (playCount === 0) return null;

  return <StarShower playCount={playCount} />;
}
