import { populateWishlistFromJson } from './wishlist-populate';

async function main() {
  console.log('🌱 Seeding wishlist (per-item model) from wishlist.json...');

  const { count, nextId } = await populateWishlistFromJson();

  console.log(`✅ Seeded ${count} items. Next id will be ${nextId}.`);
}

main().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
