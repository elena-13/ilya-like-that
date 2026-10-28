import { getPayload } from 'payload';
import config from '@payload-config';

// Fixed data the e2e tests rely on. Tests look the gift up by this title.
export const E2E_GIFT_TITLE = 'E2E Test Gift';

const payload = await getPayload({ config });

// Safety net: never wipe a database that isn't the e2e one.
if (!process.env.DATABASE_URI?.includes('_e2e')) {
  console.error('Refusing to seed: DATABASE_URI is not an e2e database.');
  process.exit(1);
}

// Start from a clean state so every run sees the same data.
await payload.delete({
  collection: 'wishlist-items',
  where: { id: { exists: true } },
});

await payload.create({
  collection: 'wishlist-items',
  data: {
    title: E2E_GIFT_TITLE,
    brand: 'E2E Brand',
    status: 'available',
    version: 1,
  },
});

console.log(`Seeded "${E2E_GIFT_TITLE}"`);

// Payload keeps the DB pool open, so exit explicitly.
process.exit(0);
