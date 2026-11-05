// Collage look for a wishlist card: each card gets its own photo shape,
// a slight tilt and a strip of tape, picked from the item id so it
// stays the same between renders.

const SHAPES = ['aspect-square', 'aspect-[4/5]', 'aspect-[5/4]', 'aspect-[3/4]', 'aspect-[4/3]'];

const TILTS = ['-rotate-2', 'rotate-1', 'rotate-0', '-rotate-1', 'rotate-2'];

// Where the tape sits and how crooked it is.
const TAPES = [
  'left-1/2 -translate-x-1/2 -rotate-[9deg]',
  'left-1/2 -translate-x-1/2 rotate-[6deg]',
  'left-[6%] -rotate-[16deg]',
  'right-[6%] rotate-[14deg]',
  'left-[22%] rotate-[4deg]',
  'right-[18%] -rotate-[11deg]',
];

// Tape size scales with the card (cqw = % of the card's width),
// so smaller cards get smaller tape.
const TAPE_SIZES = [
  'w-[28cqw] h-[8cqw]',
  'w-[34cqw] h-[9.5cqw]',
  'w-[40cqw] h-[8.5cqw]',
  'w-[24cqw] h-[10cqw]',
];

// Torn, uneven ends so the tape doesn't look cut by a machine.
const TAPE_EDGES = [
  'polygon(0 8%, 4% 0, 96% 4%, 100% 0, 98% 30%, 100% 55%, 97% 80%, 100% 100%, 3% 96%, 0 100%, 2% 70%, 0 45%, 3% 22%)',
  'polygon(2% 0, 98% 6%, 95% 25%, 100% 48%, 96% 72%, 99% 100%, 0 94%, 4% 74%, 0 52%, 5% 28%)',
  'polygon(0 0, 100% 3%, 97% 18%, 100% 36%, 96% 60%, 100% 82%, 97% 100%, 1% 97%, 4% 80%, 0 58%, 3% 35%, 0 14%)',
  'polygon(3% 4%, 97% 0, 100% 22%, 96% 41%, 100% 66%, 95% 100%, 2% 100%, 0 76%, 4% 50%, 0 26%)',
];

export function hash(value: string | number) {
  const str = String(value);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x9e3779b1);
  }
  // Spread short ids ("1", "2", …) across all bits.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
}

export function getCardLook(id: string | number) {
  const h = hash(id);
  return {
    shape: SHAPES[h % SHAPES.length],
    tilt: TILTS[(h >>> 3) % TILTS.length],
    tape: TAPES[(h >>> 6) % TAPES.length],
    tapeSize: TAPE_SIZES[(h >>> 9) % TAPE_SIZES.length],
    tapeEdge: TAPE_EDGES[(h >>> 12) % TAPE_EDGES.length],
  };
}
