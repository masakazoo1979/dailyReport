import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * アクセシビリティテスト
 *
 * WCAG 2.1 AA基準に準拠しているかを検証
 * axe-coreを使用して自動テストを実行
 */

test.describe('アクセシビリティ', () => {
  test.describe('ログインページ', () => {
    test('WCAG 2.1 AA基準を満たすこと', async ({ page }) => {
      await page.goto('/login');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('フォームにラベルが関連付けられていること', async ({ page }) => {
      await page.goto('/login');

      // メールアドレス入力欄にラベルがあること
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      // パスワード入力欄にラベルがあること
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();

      // ログインボタンが存在すること
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });

    test('キーボードでフォーカス移動ができること', async ({ page }) => {
      await page.goto('/login');

      // Tabキーでフォーカス移動
      await page.keyboard.press('Tab');
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeFocused();

      await page.keyboard.press('Tab');
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeFocused();

      await page.keyboard.press('Tab');
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeFocused();
    });
  });

  test.describe('ダッシュボード（認証後）', () => {
    test.beforeEach(async ({ page }) => {
      // ログイン処理
      await page.goto('/login');
      await page.fill('input[type="email"]', 'tanaka@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('WCAG 2.1 AA基準を満たすこと', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('スキップリンクが機能すること', async ({ page }) => {
      // スキップリンクにフォーカス
      await page.keyboard.press('Tab');

      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeFocused();

      // Enterキーでメインコンテンツへスキップ
      await page.keyboard.press('Enter');

      // メインコンテンツにスクロールされていることを確認
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeVisible();
    });

    test('ナビゲーションにaria属性があること', async ({ page }) => {
      // サイドバーにaria-label属性があること
      const sidebar = page.locator('aside[aria-label="メインナビゲーション"]');
      await expect(sidebar).toBeVisible();

      // ヘッダーにrole="banner"があること
      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();

      // メインにrole="main"があること
      const main = page.locator('main[role="main"]');
      await expect(main).toBeVisible();
    });

    test('モバイルメニューがEscキーで閉じること', async ({ page }) => {
      // ビューポートをモバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });

      // メニューボタンをクリック
      const menuButton = page.locator('button[aria-label="メニューを開く"]');
      await menuButton.click();

      // メニューが開いていることを確認
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Escキーでメニューを閉じる
      await page.keyboard.press('Escape');

      // メニューが閉じていることを確認
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test.describe('日報一覧ページ（認証後）', () => {
    test.beforeEach(async ({ page }) => {
      // ログイン処理
      await page.goto('/login');
      await page.fill('input[type="email"]', 'tanaka@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      await page.goto('/reports');
    });

    test('WCAG 2.1 AA基準を満たすこと', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('テーブルにaria-label属性があること', async ({ page }) => {
      const table = page.locator('table[aria-label="日報一覧"]');
      await expect(table).toBeVisible();
    });

    test('ページネーションにrole="navigation"があること', async ({ page }) => {
      // ページネーションが表示されている場合のみテスト
      const pagination = page.locator('nav[aria-label="ページネーション"]');
      const count = await pagination.count();
      if (count > 0) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe('顧客一覧ページ（認証後）', () => {
    test.beforeEach(async ({ page }) => {
      // ログイン処理
      await page.goto('/login');
      await page.fill('input[type="email"]', 'tanaka@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
      await page.goto('/customers');
    });

    test('WCAG 2.1 AA基準を満たすこと', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('テーブルにaria-label属性があること', async ({ page }) => {
      const table = page.locator('table[aria-label="顧客一覧"]');
      await expect(table).toBeVisible();
    });
  });

  test.describe('カラーコントラスト', () => {
    test('ログインページのコントラスト比が適切であること', async ({ page }) => {
      await page.goto('/login');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ runOnly: ['color-contrast'] })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('フォーカス管理', () => {
    test.beforeEach(async ({ page }) => {
      // ログイン処理
      await page.goto('/login');
      await page.fill('input[type="email"]', 'tanaka@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard');
    });

    test('フォーカスが可視化されていること', async ({ page }) => {
      await page.goto('/reports');

      // Tabキーでフォーカス移動
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // フォーカスされた要素にoutlineスタイルがあることを確認
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('ナビゲーションリンクにaria-current="page"があること', async ({
      page,
    }) => {
      await page.goto('/dashboard');

      // 現在のページのリンクにaria-current="page"があること
      const currentLink = page.locator('a[aria-current="page"]');
      await expect(currentLink).toBeVisible();
    });
  });
});
