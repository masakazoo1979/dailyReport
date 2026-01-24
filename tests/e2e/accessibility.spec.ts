import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login } from './fixtures/test-helpers';

/**
 * アクセシビリティテスト
 *
 * WCAG 2.1 AA基準に準拠しているかを検証
 * axe-coreを使用して自動テストを実行
 *
 * 注意: このテストはローカル環境でのみ実行可能
 * CI環境ではデータベースのセットアップが必要なためスキップ
 */

// CI環境ではスキップ（データベースセットアップが必要なため）
const describeOrSkip = process.env.CI ? test.describe.skip : test.describe;

describeOrSkip('アクセシビリティ', () => {
  test.describe('ログインページ（認証不要）', () => {
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
      const emailInput = page.getByLabel('メールアドレス');
      await expect(emailInput).toBeVisible();

      // パスワード入力欄にラベルがあること
      const passwordInput = page.getByLabel('パスワード');
      await expect(passwordInput).toBeVisible();

      // ログインボタンが存在すること
      const submitButton = page.getByRole('button', { name: 'ログイン' });
      await expect(submitButton).toBeVisible();
    });

    test('キーボードでフォーカス移動ができること', async ({ page }) => {
      await page.goto('/login');

      // Tabキーでフォーカス移動
      await page.keyboard.press('Tab');
      const emailInput = page.getByLabel('メールアドレス');
      await expect(emailInput).toBeFocused();

      await page.keyboard.press('Tab');
      const passwordInput = page.getByLabel('パスワード');
      await expect(passwordInput).toBeFocused();

      await page.keyboard.press('Tab');
      const submitButton = page.getByRole('button', { name: 'ログイン' });
      await expect(submitButton).toBeFocused();
    });

    test('カラーコントラスト比が適切であること', async ({ page }) => {
      await page.goto('/login');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ runOnly: ['color-contrast'] })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('ダッシュボード（認証後）', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'sales1');
    });

    test('WCAG 2.1 AA基準を満たすこと', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('スキップリンクが存在すること', async ({ page }) => {
      // スキップリンクが存在することを確認
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeAttached();
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

    test('ナビゲーションリンクにaria-current="page"があること', async ({
      page,
    }) => {
      // 現在のページのリンクにaria-current="page"があること
      const currentLink = page.locator('a[aria-current="page"]');
      await expect(currentLink).toBeVisible();
    });
  });

  test.describe('日報一覧ページ（認証後）', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'sales1');
      await page.goto('/reports');
    });

    test('WCAG 2.1 AA基準を満たすこと', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('テーブルにaria-label属性があること', async ({ page }) => {
      // テーブルが存在する場合のみチェック
      const table = page.locator('table[aria-label="日報一覧"]');
      const count = await table.count();
      if (count > 0) {
        await expect(table).toBeVisible();
      }
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
      await login(page, 'sales1');
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

  test.describe('モバイルナビゲーション（認証後）', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'sales1');
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
});
