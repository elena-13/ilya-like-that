import { test, expect } from '@playwright/test';

import { loginAs, userA } from './helpers/auth';

test('guest sees the login button', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

test('signed-in user sees their user menu', async ({ page, context }) => {
  await loginAs(context, userA);
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Log in' })).toBeHidden();

  await page.getByRole('button', { name: 'User menu' }).click();
  await expect(page.getByText(userA.email)).toBeVisible();
});
