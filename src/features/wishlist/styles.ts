import { cn } from '@/lib/utils';

// Soft drop shadow shared by the wishlist cards and the white boxes that
// match them (item photo, status box, My gifts rows, prompts).
export const cardShadowClass =
  'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(0,0,0,0.15)]';

// White rounded card with that shadow.
export const softCardClass = cn('rounded-4xl bg-white', cardShadowClass);
