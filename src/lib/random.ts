export type Range = readonly [min: number, max: number];

export const randomBetween = ([min, max]: Range) => min + Math.random() * (max - min);

export const randomSign = () => (Math.random() < 0.5 ? -1 : 1);

export const pickRandom = <T>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

/** Picks an item with probability proportional to its `weight`; weights should sum to 1. */
export function pickWeighted<T extends { weight: number }>(items: readonly T[]): T {
  let roll = Math.random();

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
