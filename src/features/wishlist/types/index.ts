// The product itself — persisted under the `wishlist` key in KV.
export type WishlistItemBase = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  image: string;
  link: string;
};

// Booking state — persisted separately in the `bookings` hash.
export type BookingInfo = {
  isBooked: boolean;
  bookedById: string | null;
};

// Runtime item the UI renders: product + its booking state.
export type WishlistItem = WishlistItemBase & BookingInfo;
