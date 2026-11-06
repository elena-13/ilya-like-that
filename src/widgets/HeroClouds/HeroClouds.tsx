'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Image from 'next/image';

// Hero sky clouds: the two big clouds drift, bob and slowly "breathe",
// and lean away from the pointer a little (parallax).
// Everything holds still for people who prefer reduced motion.

const CLOUD = { src: '/cloud-1.webp', width: 3320, height: 2203 };

type HeroCloudsProps = {
  /** Drawn behind each cloud and drifting with it, positioned against the
   *  cloud picture's box (unmirrored, even though the left cloud is flipped). */
  behindLeftCloud?: ReactNode;
  behindRightCloud?: ReactNode;
};

export function HeroClouds({ behindLeftCloud, behindRightCloud }: HeroCloudsProps) {
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
    // Not aria-hidden: a slot may hold something interactive (the resting
    // owl). The cloud pictures themselves have empty alt text.
    <div
      ref={rootRef}
      data-hero-clouds
      className="pointer-events-none absolute inset-0 [--px:0] [--py:0]"
    >
      <div className="absolute inset-0 z-10 transition-[translate] duration-500 ease-out will-change-[translate] [translate:calc(var(--px)*-28px)_calc(var(--py)*-14px)]">
        {/* right cloud */}
        <div className="absolute top-1/2 left-1/2 w-full max-w-none">
          {/* The drift moves the slot along with the cloud, so anything
              hiding behind it stays hidden. */}
          <div
            data-cloud-slot="right"
            className="relative transform-gpu will-change-transform motion-safe:animate-[cloud-drift-1_18s_ease-in-out_infinite]"
          >
            {behindRightCloud}
            <Image
              src={CLOUD.src}
              alt=""
              width={CLOUD.width}
              height={CLOUD.height}
              priority
              // Without sizes the browser picked the 3840px file; the cloud is
              // about as wide as the screen.
              sizes="100vw"
              className="relative block h-auto w-full"
            />
          </div>
        </div>

        {/* left cloud */}
        <div className="absolute -top-1/15 right-1/2 w-[110%] max-w-none">
          <div
            data-cloud-slot="left"
            className="relative transform-gpu will-change-transform motion-safe:animate-[cloud-drift-2_23s_ease-in-out_infinite] [animation-delay:-7s]"
          >
            {behindLeftCloud}
            <Image
              src={CLOUD.src}
              alt=""
              width={CLOUD.width}
              height={CLOUD.height}
              priority
              sizes="100vw"
              className="relative block h-auto w-full -scale-x-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
