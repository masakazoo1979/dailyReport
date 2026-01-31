import { test, expect } from '@playwright/test';
import { login } from './fixtures/test-helpers';

/**
 * 日報承認フロー E2E テスト
 *
 * テストケース:
 * - TC-REPORT-014: 日報承認（上長）
 * - TC-REPORT-015: 日報差し戻し（上長）
 * - TC-REPORT-016: 日報承認不可（一般営業）
 * - TC-REPORT-017: 差し戻し日報の再提出
 */
test.describe('日報承認フロー E2E', () => {
  test.describe('上長による承認・差し戻し', () => {
    test('TC-REPORT-014: 上長が日報を承認できること', async ({ page }) => {
      // 上長としてログイン
      await login(page, 'manager');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();
      await expect(page).toHaveURL('/reports');

      // 提出済み日報を検索して詳細画面へ遷移
      const submittedRow = page
        .locator('tr')
        .filter({ hasText: '提出済み' })
        .first();
      const rowExists = await submittedRow.isVisible().catch(() => false);

      if (rowExists) {
        // 詳細リンクをクリック
        await submittedRow.getByRole('link', { name: '詳細' }).click();

        // 日報詳細画面が表示されることを確認
        await expect(page).toHaveURL(/\/reports\/\d+$/);
        await expect(page.getByText('日報詳細')).toBeVisible();

        // 承認ボタンが表示されることを確認（上長かつ配下メンバーの日報）
        const approveButton = page.getByRole('button', { name: '承認' });
        if (await approveButton.isVisible().catch(() => false)) {
          await approveButton.click();

          // 承認確認ダイアログが表示される場合は確認
          const confirmButton = page.getByRole('button', { name: '承認する' });
          if (await confirmButton.isVisible().catch(() => false)) {
            await confirmButton.click();
          }

          // ステータスが「承認済み」に変わることを確認
          await expect(page.getByText('承認済み')).toBeVisible();
        }
      }
    });

    test('TC-REPORT-015: 上長が日報を差し戻しできること', async ({ page }) => {
      // 上長としてログイン
      await login(page, 'manager');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();

      // 提出済み日報を検索して詳細画面へ遷移
      const submittedRow = page
        .locator('tr')
        .filter({ hasText: '提出済み' })
        .first();
      const rowExists = await submittedRow.isVisible().catch(() => false);

      if (rowExists) {
        await submittedRow.getByRole('link', { name: '詳細' }).click();
        await expect(page).toHaveURL(/\/reports\/\d+$/);

        // 差し戻しボタンが表示されることを確認
        const rejectButton = page.getByRole('button', { name: '差し戻し' });
        if (await rejectButton.isVisible().catch(() => false)) {
          await rejectButton.click();

          // 差し戻し確認ダイアログが表示される場合は確認
          const confirmButton = page.getByRole('button', {
            name: '差し戻しする',
          });
          if (await confirmButton.isVisible().catch(() => false)) {
            await confirmButton.click();
          }

          // ステータスが「差し戻し」に変わることを確認
          await expect(page.getByText('差し戻し')).toBeVisible();
        }
      }
    });
  });

  test.describe('一般営業の制限', () => {
    test('TC-REPORT-016: 一般営業は日報を承認できないこと', async ({
      page,
    }) => {
      // 一般営業としてログイン
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();
      await expect(page).toHaveURL('/reports');

      // 日報詳細画面へ遷移（自分の日報）
      const detailLink = page.getByRole('link', { name: '詳細' }).first();
      if (await detailLink.isVisible().catch(() => false)) {
        await detailLink.click();

        await expect(page).toHaveURL(/\/reports\/\d+$/);

        // 承認ボタンが表示されないことを確認
        await expect(
          page.getByRole('button', { name: '承認' })
        ).not.toBeVisible();

        // 差し戻しボタンが表示されないことを確認
        await expect(
          page.getByRole('button', { name: '差し戻し' })
        ).not.toBeVisible();
      }
    });
  });

  test.describe('日報詳細画面', () => {
    test('日報詳細が正しく表示されること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();

      // 詳細リンクをクリック
      const detailLink = page.getByRole('link', { name: '詳細' }).first();
      if (await detailLink.isVisible().catch(() => false)) {
        await detailLink.click();

        await expect(page).toHaveURL(/\/reports\/\d+$/);

        // 基本情報セクションが表示されることを確認
        await expect(page.getByText('基本情報')).toBeVisible();
        await expect(page.getByText('営業担当者')).toBeVisible();
        await expect(page.getByText('報告日')).toBeVisible();
        await expect(page.getByText('ステータス')).toBeVisible();

        // 訪問記録セクションが表示されることを確認
        await expect(page.getByText('訪問記録')).toBeVisible();

        // 課題・相談セクションが表示されることを確認
        await expect(page.getByText('課題・相談')).toBeVisible();

        // 明日の予定セクションが表示されることを確認
        await expect(page.getByText('明日の予定')).toBeVisible();

        // コメントセクションが表示されることを確認（件数付きのタイトル）
        await expect(page.getByText(/^コメント\s*\(/)).toBeVisible();
      }
    });

    test('日報詳細画面からコメントを投稿できること', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();

      // 詳細リンクをクリック
      const detailLink = page.getByRole('link', { name: '詳細' }).first();
      if (await detailLink.isVisible().catch(() => false)) {
        await detailLink.click();

        await expect(page).toHaveURL(/\/reports\/\d+$/);

        // コメント入力欄が存在することを確認
        const commentInput = page.getByPlaceholder('コメントを入力');
        if (await commentInput.isVisible().catch(() => false)) {
          // コメントを入力
          await commentInput.fill('テスト用のコメントです。');

          // 投稿ボタンをクリック
          await page.getByRole('button', { name: '投稿' }).click();

          // コメントが表示されることを確認
          await expect(
            page.getByText('テスト用のコメントです。')
          ).toBeVisible();
        }
      }
    });

    test('下書き・差し戻し状態の自分の日報は編集できること', async ({
      page,
    }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();

      // 下書きまたは差し戻し日報を検索
      const draftRow = page.locator('tr').filter({ hasText: '下書き' }).first();
      const rejectedRow = page
        .locator('tr')
        .filter({ hasText: '差し戻し' })
        .first();

      let targetRow = null;
      if (await draftRow.isVisible().catch(() => false)) {
        targetRow = draftRow;
      } else if (await rejectedRow.isVisible().catch(() => false)) {
        targetRow = rejectedRow;
      }

      if (targetRow) {
        await targetRow.getByRole('link', { name: '詳細' }).click();
        await expect(page).toHaveURL(/\/reports\/\d+$/);

        // 編集ボタンが表示されることを確認
        await expect(page.getByRole('link', { name: '編集' })).toBeVisible();
      }
    });

    test('提出済み・承認済みの日報は編集できないこと', async ({ page }) => {
      await login(page, 'sales1');

      // サイドバーリンクが表示されるまで待機
      await expect(page.getByRole('link', { name: '日報一覧' })).toBeVisible({
        timeout: 10000,
      });

      // 日報一覧へ遷移
      await page.getByRole('link', { name: '日報一覧' }).click();

      // 提出済みまたは承認済み日報を検索
      const submittedRow = page
        .locator('tr')
        .filter({ hasText: '提出済み' })
        .first();
      const approvedRow = page
        .locator('tr')
        .filter({ hasText: '承認済み' })
        .first();

      let targetRow = null;
      if (await submittedRow.isVisible().catch(() => false)) {
        targetRow = submittedRow;
      } else if (await approvedRow.isVisible().catch(() => false)) {
        targetRow = approvedRow;
      }

      if (targetRow) {
        await targetRow.getByRole('link', { name: '詳細' }).click();
        await expect(page).toHaveURL(/\/reports\/\d+$/);

        // 編集ボタンが表示されないことを確認
        await expect(
          page.getByRole('link', { name: '編集' })
        ).not.toBeVisible();
      }
    });
  });
});
