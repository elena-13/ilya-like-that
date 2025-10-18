'use client';

import { useMemo } from 'react';

type LayerCfg = {
  count: number;
  sizeMin: number;
  sizeMax: number;
  duration: number;
  delayBase: number;
  blur: number;
};

const LAYERS: LayerCfg[] = [
  { count: 26, sizeMin: 2, sizeMax: 4, duration: 3, delayBase: 0.0, blur: 0 },
  { count: 18, sizeMin: 3, sizeMax: 6, duration: 4, delayBase: 0.6, blur: 0.3 },
  { count: 12, sizeMin: 5, sizeMax: 9, duration: 5, delayBase: 1.2, blur: 0.6 },
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
        const size = Math.round(layer.sizeMin + rnd() * (layer.sizeMax - layer.sizeMin));
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
              className="
                absolute block rounded-full bg-white opacity-0
                shadow-[0_0_6px_1px_rgba(255,255,255,0.8)]
                will-change-[opacity]
                animate-[twinkle_var(--twinkle-d)_ease-in-out_infinite]
              "
              style={{
                top: `${s.y}%`,
                left: `${s.x}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['--twinkle-d' as any]: `${s.layer.duration}s`,
                animationDelay: `${s.delay}s`,
                filter: `blur(${s.layer.blur}px)`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
