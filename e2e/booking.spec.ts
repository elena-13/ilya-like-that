import { execSync } from 'node:child_process';
import { test, expect, type Page } from '@playwright/test';

import { loginAs, userA, userB } from './helpers/auth';

// Matches the gift created by scripts/seed-e2e.ts.
const GIFT_TITLE = 'E2E Test Gift';

// The item URL contains the DB id, which changes on every seed, so open it from the home page.
async function openGift(page: Page) {
  await page.goto('/');
  await page.getByRole('heading', { name: GIFT_TITLE }).getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1, name: GIFT_TITLE })).toBeVisible();
}

// Each test builds on the previous one: book -> My gifts -> other user -> unbook.
test.describe.serial('booking a gift', () => {
  // Reseed so a retry of this group starts from an available gift again.
  test.beforeAll(() => {
    execSync('npm run seed:e2e', { stdio: 'inherit' });
  });

  test('user can book a gift', async ({ page, context }) => {
    await loginAs(context, userA);
    await openGift(page);

    await expect(page.getByText('Available', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Book', exact: true }).click();

    await expect(page.getByText('Reserved', { exact: true })).toBeVisible();
    await expect(page.getByText('You reserved this gift.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unbook' })).toBeVisible();
  });

  test('booked gift appears in My gifts', async ({ page, context }) => {
    await loginAs(context, userA);
    await page.goto('/my-gifts');

    await expect(page.getByRole('listitem').filter({ hasText: GIFT_TITLE })).toBeVisible();
  });

  test('another user sees the gift as booked', async ({ page, context }) => {
    await loginAs(context, userB);
    await openGift(page);

    await expect(page.getByText('Someone has already reserved this gift.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Book', exact: true })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Unbook' })).toBeHidden();
  });

  test('user can unbook from My gifts', async ({ page, context }) => {
    await loginAs(context, userA);
    await page.goto('/my-gifts');

    const row = page.getByRole('listitem').filter({ hasText: GIFT_TITLE });
    await row.getByRole('button', { name: 'Cancel booking' }).click();

    await expect(row).toBeHidden();
    await expect(page.getByText("You haven't booked any gifts yet")).toBeVisible();

    // And it's bookable again.
    await openGift(page);
    await expect(page.getByText('Available', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Book', exact: true })).toBeVisible();
  });
});

test.describe('booking from the home page card', () => {
  test.beforeEach(() => {
    execSync('npm run seed:e2e', { stdio: 'inherit' });
  });

  test('user can book and unbook from the card', async ({ page, context }) => {
    await loginAs(context, userA);
    await page.goto('/');

    const card = page.getByRole('article', { name: GIFT_TITLE });
    const canvasesBefore = await page.locator('canvas').count();

    // On desktop the Book button sits in an overlay that appears on hover.
    await card.hover();
    await card.getByRole('button', { name: 'Book', exact: true }).click();

    await expect(card.getByText('reserved by you')).toBeVisible();
    // Booking from the card plays the star shower, which adds a Pixi canvas.
    await expect(page.locator('canvas')).toHaveCount(canvasesBefore + 1);

    await card.getByRole('button', { name: 'Cancel booking' }).click();

    await expect(card.getByText('reserved by you')).toBeHidden();
    await card.hover();
    await expect(card.getByRole('button', { name: 'Book', exact: true })).toBeVisible();
  });
});
