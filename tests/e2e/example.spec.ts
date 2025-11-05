import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Next.js/);
});

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  const body = await page.locator('body');
  await expect(body).toBeVisible();
});