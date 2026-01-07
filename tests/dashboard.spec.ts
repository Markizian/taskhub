import { test, expect } from '@playwright/test';

test('main page opens', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Next/i);
});