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
    // Booking plays a confetti burst (Pixi is pre-warmed, so count bursts, not canvases).
    await expect(page.getByTestId('confetti')).toHaveAttribute('data-bursts', '1');
    await expect(page.getByText('You reserved this gift.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel booking' })).toBeVisible();
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
    await expect(page.getByRole('button', { name: 'Cancel booking' })).toBeHidden();
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

    // On desktop the Book button appears when hovering the card.
    await card.hover();
    await card.getByRole('button', { name: 'Book', exact: true }).click();

    // A booked card is labelled "your gift" for the person who booked it.
    await expect(card.getByText('your gift').filter({ visible: true })).toBeVisible();
    // Booking from the card plays a confetti burst.
    await expect(page.getByTestId('confetti')).toHaveAttribute('data-bursts', '1');

    // On desktop Cancel booking appears when hovering the card.
    await card.hover();
    await card.getByRole('button', { name: 'Cancel booking' }).click();

    await expect(card.getByText('your gift').filter({ visible: true })).toBeHidden();
    await card.hover();
    await expect(card.getByRole('button', { name: 'Book', exact: true })).toBeVisible();
  });
});
