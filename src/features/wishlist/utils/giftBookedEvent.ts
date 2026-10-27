const GIFT_BOOKED_EVENT = 'wishlist:gift-booked';

export function announceGiftBooked() {
  window.dispatchEvent(new Event(GIFT_BOOKED_EVENT));
}

export function onGiftBooked(listener: () => void) {
  window.addEventListener(GIFT_BOOKED_EVENT, listener);
  return () => window.removeEventListener(GIFT_BOOKED_EVENT, listener);
}
