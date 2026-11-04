import { test, expect } from '@playwright/test';

// Proves the test server is up and reading the seeded e2e database.
test('home page shows the seeded gift', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('E2E Test Gift')).toBeVisible();
});

// Private items are admin-only; the seeded one must stay hidden from guests.
test('home page hides private gifts from guests', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('E2E Test Gift')).toBeVisible();
  await expect(page.getByText('E2E Private Gift')).toHaveCount(0);
});
