import { hash } from './getCardLook';

// Shuffles items into a mixed-up collage order. The order comes from each
// item's id, so it stays the same between visits and doesn't jump around
// when a gift gets booked and the page re-renders.
export function mixOrder<T extends { id: string | number }>(items: T[]): T[] {
  return [...items].sort((a, b) => hash(`order-${a.id}`) - hash(`order-${b.id}`));
}
