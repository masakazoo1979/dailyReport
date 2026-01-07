import { test, expect } from '@playwright/test';

test.describe('Home Page E2E', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('営業日報システム')).toBeVisible();
    await expect(
      page.getByText('Sales Daily Report Management System')
    ).toBeVisible();
  });

  test('should have correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/営業日報システム/);
  });
});
