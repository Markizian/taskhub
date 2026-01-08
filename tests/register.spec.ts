import { test, expect } from '@playwright/test';

test('register', async ({ page }) => {
  const ts = Date.now();
  const email = `${ts}@mail.com`;

  await page.goto('/register');
  await page.getByPlaceholder('Name').fill('user');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill('asd');
  await page.getByRole('button', { name: /register/i }).click();

  await expect(page.getByText(/user created/i)).toBeVisible();
});