import { populateWishlistFromJson } from './wishlist-populate';

async function main() {
  console.log('🚀 Syncing wishlist catalog from wishlist.json...');

  // Bookings live in the separate `bookings` hash, so re-populating the catalog
  // from JSON is safe — nothing to preserve here.
  const { count, nextId } = await populateWishlistFromJson();

  console.log(`✅ Synced ${count} items. Next id will be ${nextId}.`);
}

main().catch((err) => {
  console.error('❌ Error during synchronization:', err);
  process.exit(1);
});
