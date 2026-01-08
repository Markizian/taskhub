import { test, expect } from '@playwright/test';

test('dashboard: create board -> create task -> toggle -> delete task -> delete board', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Loading dashboard...')).toHaveCount(0);

  // Create board
  const boardTitle = `Board ${Date.now()}`;
  await page.getByPlaceholder('New board title').fill(boardTitle);
  await page.getByRole('button', { name: 'Add board' }).click();

  const boardHeading = page.getByRole('heading', { level: 2, name: boardTitle });
  await expect(boardHeading).toBeVisible();
  const boardCard = page.locator('div.border.rounded.bg-white.shadow').filter({ has: boardHeading }).first();
  await expect(boardCard).toBeVisible();

  // Create task
  const taskTitle = `Task ${Date.now()}`;
  await boardCard.getByPlaceholder('New task').fill(taskTitle);
  await boardCard.getByRole('button', { name: 'Add' }).click();

  const taskRow = boardCard.locator('div.flex.items-center.justify-between.border.rounded.p-2', {hasText: taskTitle,}).first();
  await expect(taskRow).toBeVisible();

  // Toggle done
  const checkbox = taskRow.getByRole('checkbox');
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await expect(checkbox).toBeChecked();

  // Line-through after check
  const taskText = taskRow.locator('span', { hasText: taskTitle });
  await expect(taskText).toHaveClass(/line-through/);

  // Untoggle
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  await expect(taskText).not.toHaveClass(/line-through/);

  // Delete task
  await taskRow.getByRole('button', { name: '✕' }).click();
  await expect(boardCard.getByText(taskTitle)).toHaveCount(0);

  // Delete board
  await boardCard.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { level: 2, name: boardTitle })).toHaveCount(0);
});
