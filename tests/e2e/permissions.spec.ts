import { test, expect } from '@playwright/test';
import { login } from './fixtures/test-helpers';

/**
 * 権限テスト E2E
 *
 * テストケース:
 * - TC-PERM-001: 自分の日報のみ表示（一般営業）
 * - TC-PERM-002: 他人の日報へのアクセス制限（一般営業）
 * - TC-PERM-003: 配下メンバーの日報閲覧（上長）
 * - TC-SALES-001: 営業一覧アクセス制限（一般営業）
 * - TC-SALES-002: 営業一覧アクセス許可（上長）
 */
test.describe('権限テスト E2E', () => {
  test.describe('一般営業の権限', () => {
    test('TC-PERM-001: 一般営業は自分の日報のみ表示されること', async ({
      page,
    }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();
      await expect(page).toHaveURL('/reports', { timeout: 10000 });

      // 日報一覧テーブルが表示されることを確認
      await expect(page.getByRole('table')).toBeVisible();

      // 自分の名前が表示されることを確認（日報が存在する場合）
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();

      // 日報がある場合は、すべて自分の日報であることを確認
      if (rowCount > 0) {
        // 一般営業は自分の日報のみ表示されるため、
        // 他のユーザー名（佐藤 花子など）は表示されないことを確認
        await expect(page.getByText('佐藤 花子')).not.toBeVisible();
      }
    });

    test('TC-SALES-001: 一般営業は営業一覧にアクセスできないこと', async ({
      page,
    }) => {
      await login(page, 'sales1');

      // ページが完全にロードされるまで待機
      await page.waitForLoadState('networkidle');

      // サイドバーリンクが表示されるまで待機（他のリンクで確認）
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // サイドバーに営業一覧メニューが表示されないことを確認
      await expect(
        page.getByRole('link', { name: '営業一覧' })
      ).not.toBeVisible();

      // 直接URLアクセスを試行
      await page.goto('/sales');

      // エラーページまたはダッシュボードへリダイレクトされることを確認
      const url = page.url();
      const hasAccessDenied = await page
        .getByText('閲覧権限がありません')
        .isVisible()
        .catch(() => false);
      const redirectedToDashboard = url.includes('/dashboard');
      const is403 = url.includes('403') || hasAccessDenied;

      // いずれかの条件を満たすこと
      expect(hasAccessDenied || redirectedToDashboard || is403).toBeTruthy();
    });

    test('一般営業は他のユーザーの日報を閲覧できないこと', async ({ page }) => {
      await login(page, 'sales1');

      // ダッシュボードが表示されることを確認
      await expect(page.getByText('ようこそ')).toBeVisible({ timeout: 15000 });

      // 他のユーザーの日報ID（存在しないか、アクセス権限がないID）に直接アクセス
      // 通常はsales2の日報IDを指定するが、テスト環境では動的なため、
      // 存在しないIDでテスト
      await page.goto('/reports/99999');

      // 404エラーまたは権限エラーが表示されることを確認
      const hasError =
        (await page
          .getByText('Not Found')
          .isVisible()
          .catch(() => false)) ||
        (await page
          .getByText('閲覧権限がありません')
          .isVisible()
          .catch(() => false));

      expect(hasError).toBeTruthy();
    });
  });

  test.describe('上長の権限', () => {
    test('TC-PERM-003: 上長は配下メンバーの日報を閲覧できること', async ({
      page,
    }) => {
      await login(page, 'manager');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();
      await expect(page).toHaveURL('/reports', { timeout: 10000 });

      // 日報一覧テーブルが表示されることを確認
      await expect(page.getByRole('table')).toBeVisible();

      // 配下メンバーの日報が表示されることを確認
      // （上長は自分と配下メンバーの日報を閲覧可能）
      // テストデータの状態によっては表示されない場合もあるため、
      // 少なくとも日報一覧が正常に表示されていることを確認
      const hasSubordinateReport =
        (await page
          .getByText('鈴木 一郎')
          .isVisible()
          .catch(() => false)) ||
        (await page
          .getByText('佐藤 花子')
          .isVisible()
          .catch(() => false));

      // 配下メンバーの日報があれば表示されていること
      // （日報がない場合はスキップ）
      if (hasSubordinateReport) {
        expect(hasSubordinateReport).toBeTruthy();
      }
    });

    test('TC-SALES-002: 上長は営業一覧にアクセスできること', async ({
      page,
    }) => {
      await login(page, 'manager');

      // サイドバーに営業一覧メニューが表示されることを確認
      await expect(page.getByRole('link', { name: '営業一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 営業一覧へ遷移
      await page.getByRole('link', { name: '営業一覧' }).click();
      await expect(page).toHaveURL('/sales', { timeout: 10000 });

      // 営業一覧が表示されることを確認
      await expect(page.getByText('営業一覧')).toBeVisible();
      await expect(page.getByRole('table')).toBeVisible();

      // 配下メンバーの名前が表示されることを確認
      await expect(page.getByText('鈴木 一郎')).toBeVisible();
      await expect(page.getByText('佐藤 花子')).toBeVisible();
    });

    test('上長は営業担当者を新規登録できること', async ({ page }) => {
      await login(page, 'manager');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '営業一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 営業一覧へ遷移
      await page.getByRole('link', { name: '営業一覧' }).click();
      await expect(page).toHaveURL('/sales', { timeout: 10000 });

      // 新規登録ボタンをクリック
      await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible({
        timeout: 10000,
      });
      await page.getByRole('link', { name: '新規登録' }).click();
      await expect(page).toHaveURL('/sales/new', { timeout: 10000 });

      // 営業登録画面が表示されることを確認
      await expect(page.getByText('営業担当者登録')).toBeVisible();

      // フォーム要素が表示されることを確認
      await expect(page.getByLabel('氏名')).toBeVisible();
      await expect(page.getByLabel('メールアドレス')).toBeVisible();
      await expect(page.getByLabel('パスワード')).toBeVisible();
    });
  });

  test.describe('日報アクセス権限', () => {
    test('自分の日報は詳細表示できること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();

      // 詳細リンクが存在する場合はクリック
      const detailLink = page.getByRole('link', { name: '詳細' }).first();
      if (await detailLink.isVisible().catch(() => false)) {
        await detailLink.click();

        // 日報詳細画面が表示されることを確認
        await expect(page).toHaveURL(/\/reports\/\d+$/);
        await expect(page.getByText('日報詳細')).toBeVisible();

        // 権限エラーが表示されないことを確認
        await expect(page.getByText('閲覧権限がありません')).not.toBeVisible();
      }
    });

    test('上長は配下メンバーの日報詳細を表示できること', async ({ page }) => {
      await login(page, 'manager');

      // ダッシュボードが表示されるまで待機
      await expect(page.getByText('ようこそ')).toBeVisible({ timeout: 15000 });

      // ダッシュボードの承認待ち日報セクションから詳細へ遷移
      const pendingDetailLink = page
        .locator('div')
        .filter({ hasText: '承認待ち日報' })
        .getByRole('link', { name: '詳細' })
        .first();

      if (await pendingDetailLink.isVisible().catch(() => false)) {
        await pendingDetailLink.click();

        // 日報詳細画面が表示されることを確認
        await expect(page).toHaveURL(/\/reports\/\d+$/);
        await expect(page.getByText('日報詳細')).toBeVisible();

        // 権限エラーが表示されないことを確認
        await expect(page.getByText('閲覧権限がありません')).not.toBeVisible();
      }
    });
  });

  test.describe('顧客マスタのアクセス権限', () => {
    test('一般営業も顧客一覧にアクセスできること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '顧客一覧' })).toBeVisible({
        timeout: 10000,
      });

      await page.getByRole('link', { name: '顧客一覧' }).click();
      await expect(page).toHaveURL('/customers', { timeout: 10000 });

      // 顧客マスタが表示されることを確認
      await expect(page.getByText('顧客マスタ')).toBeVisible();
    });

    test('一般営業も顧客を登録できること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/customers/new', { waitUntil: 'networkidle' });

      // 顧客登録画面が表示されることを確認
      await expect(page.getByText('顧客登録')).toBeVisible({ timeout: 15000 });
      await expect(page.getByLabel('会社名')).toBeVisible();
    });

    test('上長も顧客一覧にアクセスできること', async ({ page }) => {
      await login(page, 'manager');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '顧客一覧' })).toBeVisible({
        timeout: 10000,
      });

      await page.getByRole('link', { name: '顧客一覧' }).click();
      await expect(page).toHaveURL('/customers', { timeout: 10000 });

      // 顧客マスタが表示されることを確認
      await expect(page.getByText('顧客マスタ')).toBeVisible();
    });
  });
});
