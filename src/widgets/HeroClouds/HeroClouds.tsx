'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

// Hero sky clouds: the two big clouds drift, bob and slowly "breathe",
// and lean away from the pointer a little (parallax).
// Everything holds still for people who prefer reduced motion.

const CLOUD = { src: '/cloud-1.webp', width: 3320, height: 2203 };

export function HeroClouds() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Pointer parallax: store where the pointer is (-1..1) as CSS variables;
  // the cloud layer multiplies them by its depth.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        root.style.setProperty('--px', x.toFixed(3));
        root.style.setProperty('--py', y.toFixed(3));
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 [--px:0] [--py:0]"
    >
      <div className="absolute inset-0 z-10 transition-[translate] duration-500 ease-out will-change-[translate] [translate:calc(var(--px)*-28px)_calc(var(--py)*-14px)]">
        {/* right cloud */}
        <div className="absolute top-1/2 left-1/2 w-full max-w-none">
          <Image
            src={CLOUD.src}
            alt=""
            width={CLOUD.width}
            height={CLOUD.height}
            priority
            // Without sizes the browser picked the 3840px file; the cloud is
            // about as wide as the screen.
            sizes="100vw"
            className="h-full w-full object-contain transform-gpu will-change-transform motion-safe:animate-[cloud-drift-1_18s_ease-in-out_infinite]"
          />
        </div>

        {/* left cloud */}
        <div className="absolute -top-1/15 right-1/2 w-[110%] max-w-none">
          <Image
            src={CLOUD.src}
            alt=""
            width={CLOUD.width}
            height={CLOUD.height}
            priority
            sizes="100vw"
            className="h-full w-full -scale-x-100 object-contain transform-gpu will-change-transform motion-safe:animate-[cloud-drift-2_23s_ease-in-out_infinite] [animation-delay:-7s]"
          />
        </div>
      </div>
    </div>
  );
}
