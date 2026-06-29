export type WishlistItem = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  image: string;
  link: string;
  isBooked: boolean;
  bookedById: string | null;
};
