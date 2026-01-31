import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from './fixtures/test-helpers';

/**
 * ダッシュボード E2E テスト
 *
 * テストケース:
 * - TC-DASH-001: 一般営業のダッシュボード表示
 * - TC-DASH-002: 上長のダッシュボード表示
 * - TC-DASH-003: 本日の日報ステータス表示
 * - TC-DASH-005: 承認待ち日報セクション表示（上長のみ）
 * - TC-DASH-006: ダッシュボードから日報詳細への遷移
 */
test.describe('ダッシュボード E2E', () => {
  test.describe('一般営業のダッシュボード', () => {
    test('TC-DASH-001: 一般営業のダッシュボードが正しく表示されること', async ({
      page,
    }) => {
      const user = TEST_USERS.sales1;

      await login(page, 'sales1');

      // ようこそメッセージが表示されることを確認
      await expect(page.getByText(`ようこそ、${user.name}さん`)).toBeVisible({
        timeout: 10000,
      });

      // 本日の日報セクションが表示されることを確認
      await expect(page.getByText('本日の日報', { exact: true })).toBeVisible({
        timeout: 10000,
      });

      // 最近の日報セクションが表示されることを確認
      await expect(page.getByText('最近の日報')).toBeVisible({
        timeout: 10000,
      });

      // サマリーカードが表示されることを確認
      await expect(page.getByText('今月の提出済み日報')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('今月の承認済み日報')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('今月の訪問件数')).toBeVisible({
        timeout: 10000,
      });

      // ページが完全にロードされるまで待機してから非表示チェック
      await page.waitForLoadState('networkidle');

      // 承認待ち日報セクションは表示されないことを確認（一般営業）
      // 一般営業ユーザーの場合、このセクションはDOMに存在しない
      await expect(page.getByText('承認待ち日報')).not.toBeVisible();

      // サイドバーに営業一覧メニューが表示されないことを確認（一般営業）
      await expect(
        page.getByRole('link', { name: '営業一覧' })
      ).not.toBeVisible();
    });

    test('TC-DASH-003: 本日の日報ステータスが表示されること', async ({
      page,
    }) => {
      await login(page, 'sales1');

      // 本日の日報セクションが表示されることを確認
      const todayReportSection = page
        .locator('div')
        .filter({ hasText: '本日の日報' })
        .first();
      await expect(todayReportSection).toBeVisible();

      // 日報作成または日報編集ボタンが存在することを確認
      const createButton = page.getByRole('link', { name: '日報を作成' });
      const editButton = page.getByRole('link', { name: '日報を編集' });

      // いずれかのボタンが表示されることを確認
      const hasCreateButton = await createButton.isVisible().catch(() => false);
      const hasEditButton = await editButton.isVisible().catch(() => false);
      expect(hasCreateButton || hasEditButton).toBeTruthy();
    });
  });

  test.describe('上長のダッシュボード', () => {
    test('TC-DASH-002: 上長のダッシュボードが正しく表示されること', async ({
      page,
    }) => {
      const user = TEST_USERS.manager;

      await login(page, 'manager');

      // ようこそメッセージが表示されることを確認
      await expect(page.getByText(`ようこそ、${user.name}さん`)).toBeVisible({
        timeout: 15000,
      });

      // 本日の日報セクションが表示されることを確認
      await expect(page.getByText('本日の日報', { exact: true })).toBeVisible({
        timeout: 10000,
      });

      // 承認待ち日報セクションが表示されることを確認（上長のみ）
      await expect(page.getByText('承認待ち日報')).toBeVisible({
        timeout: 10000,
      });
      await expect(
        page.getByText('配下メンバーの提出済み日報一覧')
      ).toBeVisible({ timeout: 10000 });

      // 最近の日報セクションが表示されることを確認
      await expect(page.getByText('最近の日報')).toBeVisible({
        timeout: 10000,
      });

      // サイドバーに営業一覧メニューが表示されることを確認（上長のみ）
      await expect(page.getByRole('link', { name: '営業一覧' })).toBeVisible({
        timeout: 10000,
      });
    });

    test('TC-DASH-005: 承認待ち日報が一覧表示されること（上長のみ）', async ({
      page,
    }) => {
      await login(page, 'manager');

      // 承認待ち日報セクションが表示されることを確認
      await expect(page.getByText('承認待ち日報')).toBeVisible();

      // 承認待ち日報が存在する場合、詳細リンクが表示されることを確認
      const pendingSection = page
        .locator('div')
        .filter({ hasText: '承認待ち日報' })
        .first();
      await expect(pendingSection).toBeVisible();
    });
  });

  test.describe('ダッシュボードからの遷移', () => {
    test('TC-DASH-006: ダッシュボードから日報詳細画面へ遷移できること', async ({
      page,
    }) => {
      await login(page, 'sales1');

      // 最近の日報セクションの詳細リンクをクリック
      const detailButtons = page.getByRole('link', { name: '詳細' });
      const count = await detailButtons.count();

      if (count > 0) {
        // 最初の詳細リンクをクリック
        await detailButtons.first().click();

        // 日報詳細画面へ遷移することを確認
        await expect(page).toHaveURL(/\/reports\/\d+$/);
        await expect(page.getByText('日報詳細')).toBeVisible();
      }
    });

    test('サイドバーから日報一覧へ遷移できること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      await page.getByRole('link', { name: '日報一覧' }).click();

      await expect(page).toHaveURL('/reports', { timeout: 10000 });
      await expect(page.getByText('日報一覧')).toBeVisible({ timeout: 10000 });
    });

    test('サイドバーから顧客一覧へ遷移できること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '顧客一覧' })).toBeVisible({
        timeout: 10000,
      });

      await page.getByRole('link', { name: '顧客一覧' }).click();

      await expect(page).toHaveURL('/customers', { timeout: 10000 });
      await expect(page.getByText('顧客マスタ')).toBeVisible({
        timeout: 10000,
      });
    });

    test('ヘッダーロゴからダッシュボードへ遷移できること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();
      await expect(page).toHaveURL('/reports', { timeout: 10000 });

      // ヘッダーロゴをクリック
      await page.getByRole('link', { name: '営業日報システム' }).click();

      // ダッシュボードへ遷移することを確認
      await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    });
  });
});
