import { test, expect } from '@playwright/test';

test('dashboard not authenticated', async ({ page, context }) => {
  await context.clearCookies();

  await page.goto('/');
  await expect(page.getByText('Not authenticated')).toBeVisible();
});