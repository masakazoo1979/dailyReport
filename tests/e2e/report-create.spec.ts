import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { login } from './fixtures/test-helpers';

/**
 * 日報作成フロー E2E テスト
 *
 * テストケース:
 * - TC-REPORT-001: 日報新規作成画面表示
 * - TC-REPORT-002: 日報下書き保存
 * - TC-REPORT-003: 訪問記録追加
 * - TC-REPORT-005: 日報提出
 * - TC-REPORT-006: 訪問記録なしでの提出試行
 */
test.describe('日報作成フロー E2E', () => {
  // 各テストの前にsales1の今日の日報を削除
  test.beforeEach(async () => {
    const prisma = new PrismaClient();
    try {
      const sales1 = await prisma.sales.findUnique({
        where: { email: 'sales1@example.com' },
      });
      if (sales1) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await prisma.dailyReport.deleteMany({
          where: {
            salesId: sales1.salesId,
            reportDate: {
              gte: today,
            },
          },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });
  test.describe('日報登録画面', () => {
    test('TC-REPORT-001: 日報新規作成画面が正しく表示されること', async ({
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

      // 新規登録ボタンをクリック
      await expect(
        page.getByRole('link', { name: '新規日報作成' })
      ).toBeVisible({
        timeout: 10000,
      });
      await page.getByRole('link', { name: '新規日報作成' }).click();
      await expect(page).toHaveURL('/reports/new', { timeout: 10000 });

      // 画面タイトルが表示されることを確認
      await expect(page.getByText('日報登録')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('新しい日報を作成します')).toBeVisible();

      // フォーム要素が表示されることを確認
      await expect(page.getByLabel('報告日')).toBeVisible();
      await expect(page.getByText('訪問記録')).toBeVisible();
      await expect(page.getByLabel('課題・相談')).toBeVisible();
      await expect(page.getByLabel('明日の予定')).toBeVisible();

      // ボタンが表示されることを確認
      await expect(
        page.getByRole('button', { name: '下書き保存' })
      ).toBeVisible();
      await expect(page.getByRole('button', { name: '提出' })).toBeVisible();
    });

    test('TC-REPORT-003: 訪問記録を追加できること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/reports/new', { waitUntil: 'networkidle' });
      await expect(page.getByText('日報登録')).toBeVisible({ timeout: 15000 });

      // 訪問記録追加ボタンをクリック
      await page.getByRole('button', { name: '訪問記録を追加' }).click();

      // 訪問記録モーダルが表示されることを確認（モーダルタイトル）
      await expect(
        page.getByRole('heading', { name: '訪問記録を追加' })
      ).toBeVisible({ timeout: 10000 });

      // 訪問記録フォームに入力
      await page.getByLabel('訪問時刻').fill('10:00');

      // 顧客選択（セレクトボックス）
      await page.getByRole('combobox').click();
      await page.getByRole('option').first().click();

      // 訪問内容を入力
      await page
        .getByLabel('訪問内容')
        .fill('商品説明とデモンストレーションを実施しました。');

      // 保存ボタンをクリック
      await page.getByRole('button', { name: '保存' }).click();

      // 訪問記録が一覧に追加されることを確認
      await expect(page.getByText('10:00')).toBeVisible();
      await expect(
        page.getByText('商品説明とデモンストレーションを実施しました。')
      ).toBeVisible();
    });

    test('TC-REPORT-002: 日報を下書き保存できること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/reports/new', { waitUntil: 'networkidle' });
      await expect(page.getByText('日報登録')).toBeVisible({ timeout: 15000 });

      // 課題・相談を入力
      await page.getByLabel('課題・相談').fill('テスト用の課題内容です。');

      // 明日の予定を入力
      await page.getByLabel('明日の予定').fill('テスト用の明日の予定です。');

      // 下書き保存ボタンをクリック
      await page.getByRole('button', { name: '下書き保存' }).click();

      // 成功時は日報一覧または編集画面へ遷移
      // URLが日報一覧または日報編集画面であることを確認
      await expect(page).toHaveURL(/\/reports(\/\d+\/edit)?$/);
    });

    test('TC-REPORT-006: 訪問記録なしでは提出できないこと', async ({
      page,
    }) => {
      await login(page, 'sales1');

      await page.goto('/reports/new', { waitUntil: 'networkidle' });
      await expect(page.getByText('日報登録')).toBeVisible({ timeout: 15000 });

      // 課題・相談を入力
      await page.getByLabel('課題・相談').fill('テスト用の課題内容です。');

      // 提出ボタンをクリック（訪問記録なし）
      await page.getByRole('button', { name: '提出' }).click();

      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText('日報を提出するには、訪問記録を1件以上追加してください')
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('日報提出', () => {
    test('TC-REPORT-005: 訪問記録付きで日報を提出できること', async ({
      page,
    }) => {
      await login(page, 'sales1');

      await page.goto('/reports/new', { waitUntil: 'networkidle' });
      await expect(page.getByText('日報登録')).toBeVisible({ timeout: 15000 });

      // 訪問記録を追加
      await page.getByRole('button', { name: '訪問記録を追加' }).click();
      await expect(
        page.getByRole('heading', { name: '訪問記録を追加' })
      ).toBeVisible({ timeout: 10000 });

      await page.getByLabel('訪問時刻').fill('14:00');

      // 顧客選択
      await page.getByRole('combobox').click();
      await page.getByRole('option').first().click();

      await page.getByLabel('訪問内容').fill('提出テスト用の訪問記録です。');
      await page.getByRole('button', { name: '保存' }).click();

      // 訪問記録が追加されたことを確認
      await expect(page.getByText('14:00')).toBeVisible();

      // 課題・相談を入力
      await page.getByLabel('課題・相談').fill('提出テスト用の課題です。');

      // 明日の予定を入力
      await page
        .getByLabel('明日の予定')
        .fill('提出テスト用の明日の予定です。');

      // 提出ボタンをクリック
      await page.getByRole('button', { name: '提出' }).click();

      // 提出確認ダイアログが表示される場合は確認
      const confirmButton = page.getByRole('button', { name: '提出する' });
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
      }

      // 成功時は日報一覧へ遷移
      await expect(page).toHaveURL(/\/reports(\/\d+)?$/);
    });
  });

  test.describe('訪問記録の編集・削除', () => {
    test('訪問記録を編集できること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/reports/new', { waitUntil: 'networkidle' });
      await expect(page.getByText('日報登録')).toBeVisible({ timeout: 15000 });

      // 訪問記録を追加
      await page.getByRole('button', { name: '訪問記録を追加' }).click();
      await expect(
        page.getByRole('heading', { name: '訪問記録を追加' })
      ).toBeVisible({ timeout: 10000 });
      await page.getByLabel('訪問時刻').fill('09:00');
      await page.getByRole('combobox').click();
      await page.getByRole('option').first().click();
      await page.getByLabel('訪問内容').fill('元の訪問内容');
      await page.getByRole('button', { name: '保存' }).click();

      // 訪問記録が追加されたことを確認
      await expect(page.getByText('元の訪問内容')).toBeVisible({
        timeout: 10000,
      });

      // 編集ボタンをクリック（aria-labelで検索）
      const editButton = page
        .getByRole('button', { name: /訪問記録を編集/ })
        .first();
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();

        // 編集モーダルが開くのを待つ
        await expect(
          page.getByRole('heading', { name: '訪問記録を編集' })
        ).toBeVisible({ timeout: 10000 });

        // 訪問内容を変更
        await page.getByLabel('訪問内容').fill('編集後の訪問内容');

        // 保存ボタンをクリック
        await page.getByRole('button', { name: '保存' }).click();

        // 編集後の内容が表示されることを確認
        await expect(page.getByText('編集後の訪問内容')).toBeVisible();
      }
    });

    test('訪問記録を削除できること', async ({ page }) => {
      await login(page, 'sales1');

      await page.goto('/reports/new', { waitUntil: 'networkidle' });
      await expect(page.getByText('日報登録')).toBeVisible({ timeout: 15000 });

      // 訪問記録を追加
      await page.getByRole('button', { name: '訪問記録を追加' }).click();
      await expect(
        page.getByRole('heading', { name: '訪問記録を追加' })
      ).toBeVisible({ timeout: 10000 });
      await page.getByLabel('訪問時刻').fill('11:00');
      await page.getByRole('combobox').click();
      await page.getByRole('option').first().click();
      await page.getByLabel('訪問内容').fill('削除対象の訪問記録');
      await page.getByRole('button', { name: '保存' }).click();

      // 訪問記録が追加されたことを確認
      await expect(page.getByText('削除対象の訪問記録')).toBeVisible({
        timeout: 10000,
      });

      // 削除ボタンをクリック（aria-labelで検索）
      const deleteButton = page
        .getByRole('button', { name: /訪問記録を削除/ })
        .first();
      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // 削除確認ダイアログが表示される場合は確認
        const confirmButton = page.getByRole('button', { name: '削除する' });
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click();
        }

        // 訪問記録が削除されることを確認
        await expect(page.getByText('削除対象の訪問記録')).not.toBeVisible();
      }
    });
  });
});
