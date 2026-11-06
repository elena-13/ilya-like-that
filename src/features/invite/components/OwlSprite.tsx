import { forwardRef, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';
import { OWL_SPRITE } from '../config';

type OwlSpriteProps = {
  /** Sprite sheet to play. */
  src?: string;
  /** Flaps per second. */
  flapsPerSecond?: number;
  className?: string;
  style?: CSSProperties;
  imgRef?: React.Ref<HTMLImageElement>;
};

// Flying owl drawn from a sprite sheet: all frames sit side by side in one
// image, and a stepped animation slides the strip one frame at a time.
// Size it with width (or className); the height follows the frame shape.
export const OwlSprite = forwardRef<HTMLDivElement, OwlSpriteProps>(function OwlSprite(
  { src = OWL_SPRITE.carrying, flapsPerSecond = 1.6, className, style, imgRef },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn('pointer-events-none overflow-hidden', className)}
      style={{ aspectRatio: `${OWL_SPRITE.frameWidth} / ${OWL_SPRITE.frameHeight}`, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- sprite sheet, sized and moved by CSS */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        className="block h-full max-w-none will-change-transform motion-safe:animate-[sprite-strip_var(--flap)_steps(var(--frames))_infinite]"
        style={
          {
            width: `${OWL_SPRITE.frames * 100}%`,
            '--flap': `${1 / flapsPerSecond}s`,
            '--frames': OWL_SPRITE.frames,
          } as CSSProperties
        }
      />
    </div>
  );
});
