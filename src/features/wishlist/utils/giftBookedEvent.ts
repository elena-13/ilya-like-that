const GIFT_BOOKED_EVENT = 'wishlist:gift-booked';
const GIFT_BOOKING_FAILED_EVENT = 'wishlist:gift-booking-failed';

/** Where the confetti bursts from, in viewport pixels. */
export type BurstOrigin = { x: number; y: number };

/** The centre of the element the guest clicked. */
export function getBurstOrigin(element: Element): BurstOrigin {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/**
 * Fired as soon as the guest clicks Book, so the confetti doesn't wait on the
 * server round-trip. `announceGiftBookingFailed` takes it back if the booking fails.
 */
export function announceGiftBooked(origin?: BurstOrigin) {
  window.dispatchEvent(
    new CustomEvent<BurstOrigin | undefined>(GIFT_BOOKED_EVENT, { detail: origin }),
  );
}

export function announceGiftBookingFailed() {
  window.dispatchEvent(new Event(GIFT_BOOKING_FAILED_EVENT));
}

export function onGiftBooked(listener: (origin?: BurstOrigin) => void) {
  const handle = (event: Event) => listener((event as CustomEvent<BurstOrigin | undefined>).detail);
  window.addEventListener(GIFT_BOOKED_EVENT, handle);
  return () => window.removeEventListener(GIFT_BOOKED_EVENT, handle);
}

export function onGiftBookingFailed(listener: () => void) {
  window.addEventListener(GIFT_BOOKING_FAILED_EVENT, listener);
  return () => window.removeEventListener(GIFT_BOOKING_FAILED_EVENT, listener);
}
