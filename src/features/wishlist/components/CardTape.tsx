import { cn } from '@/lib/utils';
import type { getCardLook } from '../utils/getCardLook';

// Gingham tape across the top edge of a card. The card must be a size
// container (`@container`) and `relative`; the tape scales with its width.
// The outer span places it and casts the shadow, the inner one is clipped
// to the torn shape (a clip would cut the shadow off).
export function CardTape({ look }: { look: ReturnType<typeof getCardLook> }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute -top-[6cqw] z-20',
        'drop-shadow-[0_1px_1.5px_rgb(0_0_0/0.22)]',
        look.tape,
        look.tapeSize,
      )}
    >
      <span
        className={cn('tape-gingham tape-wrinkles block size-full', look.tapeWrinkles)}
        style={{ clipPath: look.tapeEdge }}
      />
    </span>
  );
}
