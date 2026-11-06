'use client';

import { useMemo } from 'react';

type LayerCfg = {
  count: number;
  sizeMin: number;
  sizeMax: number;
  duration: number;
  delayBase: number;
  // Crossed light rays through the star (only on the bigger ones).
  rays: boolean;
};

const LAYERS: LayerCfg[] = [
  { count: 26, sizeMin: 1, sizeMax: 2, duration: 3, delayBase: 0.0, rays: false },
  { count: 18, sizeMin: 1.5, sizeMax: 2.5, duration: 4, delayBase: 0.6, rays: false },
  { count: 10, sizeMin: 2, sizeMax: 3, duration: 6, delayBase: 1.2, rays: true },
];

function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function StarsField({ seed = 12345 }: { seed?: number }) {
  const seededLayers = useMemo(() => {
    return LAYERS.map((layer, li) => {
      const rnd = makeRng(seed + li * 77);
      return Array.from({ length: layer.count }).map(() => {
        const x = Math.round(rnd() * 100);
        const y = Math.round(rnd() * 100);
        const size = +(layer.sizeMin + rnd() * (layer.sizeMax - layer.sizeMin)).toFixed(1);
        const delay = (layer.delayBase + rnd() * 2).toFixed(2);
        return { x, y, size, delay, layer };
      });
    });
  }, [seed]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {seededLayers.map((stars, idx) => (
        <div key={idx} className="absolute inset-0">
          {stars.map((s, i) => (
            <span
              key={i}
              className={`
                absolute block rounded-full bg-white opacity-0
                shadow-[0_0_3px_0.5px_rgba(255,255,255,1),0_0_8px_2px_rgba(255,255,255,0.55),0_0_16px_4px_rgba(255,214,245,0.3)]
                will-change-[opacity,transform]
                animate-[twinkle_var(--twinkle-d)_ease-in-out_infinite]
                ${s.layer.rays ? 'star-rays' : ''}
              `}
              style={{
                top: `${s.y}%`,
                left: `${s.x}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['--twinkle-d' as any]: `${s.layer.duration}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
