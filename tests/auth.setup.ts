import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('auth via UI and save storage', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Email').fill(process.env.EMAIL ?? 'test@mail.com');
  await page.getByPlaceholder('Password').fill(process.env.PASSWORD ?? 'asd');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page.getByText('Wrong email or password')).toHaveCount(0);

  await expect(page).toHaveURL('/', { timeout: 30_000 });

  await page.context().storageState({ path: authFile });
});