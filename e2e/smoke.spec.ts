import { test, expect } from '@playwright/test';

// Proves the test server is up and reading the seeded e2e database.
test('home page shows the seeded gift', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('E2E Test Gift')).toBeVisible();
});
