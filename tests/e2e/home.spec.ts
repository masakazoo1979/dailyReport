import { test, expect } from '@playwright/test';

test.describe('Home Page E2E', () => {
  test('should redirect to login page when unauthenticated', async ({
    page,
  }) => {
    await page.goto('/');

    // 未認証時はログインページにリダイレクトされる
    await expect(page).toHaveURL(/\/login(\\?.*)?$/, { timeout: 10000 });

    // ログインページが表示されることを確認
    await expect(page.getByLabel('メールアドレス')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should have correct title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // リダイレクト先でタイトルが設定されていることを確認
    await expect(page).toHaveTitle(/.+/);
  });
});
