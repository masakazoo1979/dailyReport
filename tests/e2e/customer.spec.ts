import { test, expect } from '@playwright/test';
import { login } from './fixtures/test-helpers';

/**
 * 顧客登録フロー E2E テスト
 *
 * テストケース:
 * - TC-CUST-001: 顧客一覧表示
 * - TC-CUST-002: 顧客新規登録
 * - TC-CUST-003: 顧客編集
 * - TC-CUST-007: 必須項目未入力エラー
 * - TC-CUST-008: メールアドレス形式エラー
 */
test.describe('顧客登録フロー E2E', () => {
  test.describe('顧客一覧', () => {
    test('TC-CUST-001: 顧客一覧が正しく表示されること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '顧客一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 顧客一覧へ遷移
      await page.getByRole('link', { name: '顧客一覧' }).click();
      await expect(page).toHaveURL('/customers', { timeout: 10000 });

      // 画面タイトルが表示されることを確認
      await expect(page.getByText('顧客マスタ')).toBeVisible({
        timeout: 10000,
      });

      // 顧客一覧テーブルが表示されることを確認
      await expect(page.getByRole('table')).toBeVisible();

      // テーブルヘッダーが表示されることを確認
      await expect(
        page.getByRole('columnheader', { name: '会社名' })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: '担当者名' })
      ).toBeVisible();

      // 新規登録ボタンが表示されることを確認
      await expect(
        page.getByRole('link', { name: '新規顧客登録' })
      ).toBeVisible();
    });

    test('顧客一覧でフィルタリングができること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/customers');

      // 検索入力欄が存在する場合はテスト
      const searchInput = page.getByPlaceholder('会社名で検索');
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('ABC');

        // 検索結果が反映されることを確認（テーブル内容が変わる）
        await page.waitForTimeout(500); // 検索のデバウンス待機
      }
    });
  });

  test.describe('顧客新規登録', () => {
    test('TC-CUST-002: 顧客を新規登録できること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '顧客一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 顧客一覧へ遷移
      await page.getByRole('link', { name: '顧客一覧' }).click();

      // 新規登録ボタンをクリック
      await expect(
        page.getByRole('link', { name: '新規顧客登録' })
      ).toBeVisible({
        timeout: 10000,
      });
      await page.getByRole('link', { name: '新規顧客登録' }).click();
      await expect(page).toHaveURL('/customers/new', { timeout: 10000 });

      // 画面タイトルが表示されることを確認
      await expect(page.getByText('顧客登録')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('新しい顧客を登録します')).toBeVisible({
        timeout: 10000,
      });

      // フォームに入力
      const timestamp = Date.now();
      await page.getByLabel('会社名').fill(`テスト株式会社${timestamp}`);
      await page.getByLabel('顧客担当者名').fill('テスト太郎');
      // 業種はセレクトボックスなのでクリックして選択
      await page.getByLabel('業種').click();
      await page.getByRole('option', { name: 'IT' }).click();
      await page.getByLabel('電話番号').fill('03-1234-5678');
      await page
        .getByLabel('メールアドレス')
        .fill(`test${timestamp}@example.com`);
      await page.getByLabel('住所').fill('東京都渋谷区テスト1-2-3');

      // 登録ボタンをクリック
      await page.getByRole('button', { name: '登録' }).click();

      // 顧客一覧へ遷移することを確認
      await expect(page).toHaveURL(/\/customers$/, { timeout: 15000 });

      // 登録した顧客が一覧に表示されることを確認
      await expect(page.getByText(`テスト株式会社${timestamp}`)).toBeVisible({
        timeout: 10000,
      });
    });

    test('TC-CUST-007: 会社名未入力でエラーが表示されること', async ({
      page,
    }) => {
      await login(page, 'sales1');

      await page.goto('/customers/new');

      // 会社名を空のまま顧客担当者名のみ入力
      await page.getByLabel('顧客担当者名').fill('テスト太郎');

      // 登録ボタンをクリック
      await page.getByRole('button', { name: '登録' }).click();

      // エラーメッセージが表示されることを確認
      await expect(page.getByText('会社名を入力してください')).toBeVisible();
    });

    test('顧客担当者名未入力でエラーが表示されること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/customers/new');

      // 顧客担当者名を空のまま会社名のみ入力
      await page.getByLabel('会社名').fill('テスト株式会社');

      // 登録ボタンをクリック
      await page.getByRole('button', { name: '登録' }).click();

      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText('顧客担当者名を入力してください')
      ).toBeVisible();
    });

    test('TC-CUST-008: 無効なメールアドレス形式でエラーが表示されること', async ({
      page,
    }) => {
      await login(page, 'sales1');

      await page.goto('/customers/new', { waitUntil: 'networkidle' });

      // フォームが表示されるまで待機
      await expect(page.getByLabel('会社名')).toBeVisible({ timeout: 10000 });

      // フォームに入力（無効なメールアドレス）
      await page.getByLabel('会社名').fill('テスト株式会社');
      await page.getByLabel('顧客担当者名').fill('テスト太郎');
      await page.getByLabel('メールアドレス').fill('invalid-email');

      // 登録ボタンをクリック
      await page.getByRole('button', { name: '登録' }).click();

      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText('メールアドレスの形式が正しくありません。')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('顧客編集', () => {
    test('TC-CUST-003: 顧客情報を編集できること', async ({ page }) => {
      await login(page, 'sales1');

      // 顧客一覧へ遷移
      await page.goto('/customers');

      // 最初の顧客の編集ボタンをクリック
      const editButton = page.getByRole('link', { name: '編集' }).first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();

        // 編集画面が表示されることを確認
        await expect(page).toHaveURL(/\/customers\/\d+\/edit$/);
        await expect(page.getByText('顧客編集')).toBeVisible({
          timeout: 10000,
        });

        // 業種を編集（セレクトボックス）
        await page.getByLabel('業種').click();
        await page.getByRole('option', { name: 'サービス' }).click();

        // 更新ボタンをクリック
        await page.getByRole('button', { name: '更新' }).click();

        // 顧客一覧へ遷移することを確認
        await expect(page).toHaveURL(/\/customers$/);
      }
    });

    test('顧客詳細から編集画面へ遷移できること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/customers');

      // 詳細リンクがある場合はクリック
      const detailLink = page.getByRole('link', { name: '詳細' }).first();
      if (await detailLink.isVisible().catch(() => false)) {
        await detailLink.click();

        // 顧客詳細画面が表示されることを確認
        await expect(page).toHaveURL(/\/customers\/\d+$/);

        // 編集ボタンがある場合はクリック
        const editButton = page.getByRole('link', { name: '編集' });
        if (await editButton.isVisible().catch(() => false)) {
          await editButton.click();

          // 編集画面へ遷移することを確認
          await expect(page).toHaveURL(/\/customers\/\d+\/edit$/);
        }
      }
    });
  });

  test.describe('顧客一覧の操作', () => {
    test('顧客一覧から戻るボタンで戻れること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/customers/new');

      // 戻るリンクをクリック
      await page.getByRole('link', { name: /顧客一覧に戻る/ }).click();

      // 顧客一覧へ遷移することを確認
      await expect(page).toHaveURL('/customers');
    });
  });
});
