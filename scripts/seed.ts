import { kv } from '@vercel/kv';
import wishlistData from '../src/features/wishlist/data/wishlist.json';

async function main() {
  console.log('Seeding wishlist data to Vercel KV...');

  await kv.set('wishlist', wishlistData);

  console.log('✅ Data seeded successfully!');
}

main().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
