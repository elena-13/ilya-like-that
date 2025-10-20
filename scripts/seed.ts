import { kv } from '@vercel/kv';
import wishlistData from '../src/features/wishlist/data/wishlist.json';
import { WISHLIST_KEY } from '@/features/wishlist/constants';

async function main() {
  console.log('Seeding wishlist data to Vercel KV...');

  await kv.set(WISHLIST_KEY, wishlistData);

  console.log('✅ Data seeded successfully!');
}

main().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
