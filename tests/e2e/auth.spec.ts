import { test, expect } from '@playwright/test';
import { TEST_USERS, login, logout } from './fixtures/test-helpers';

/**
 * 認証フロー E2E テスト
 *
 * テストケース:
 * - TC-AUTH-001: 一般営業ログイン成功
 * - TC-AUTH-002: 上長ログイン成功
 * - TC-AUTH-003: 無効な資格情報でのログイン失敗
 * - TC-AUTH-004: 空のメールアドレスでのログイン試行
 * - TC-AUTH-005: 空のパスワードでのログイン試行
 * - TC-AUTH-007: ログアウト
 * - TC-AUTH-008: 未認証時のダッシュボードアクセス
 */
test.describe('認証フロー E2E', () => {
  test.describe('ログイン', () => {
    test('TC-AUTH-001: 一般営業でログインできること', async ({ page }) => {
      const user = TEST_USERS.sales1;

      await page.goto('/login', { waitUntil: 'networkidle' });

      // ログインフォームが表示されることを確認（hydration完了を待つ）
      await expect(page.getByLabel('メールアドレス')).toBeVisible({
        timeout: 15000,
      });

      // メールアドレスとパスワードを入力
      await page.getByLabel('メールアドレス').fill(user.email);
      await page.getByLabel('パスワード').fill(user.password);

      // ログインボタンをクリック
      await page.getByRole('button', { name: 'ログイン' }).click();

      // ダッシュボードへ遷移することを確認
      await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
      await expect(page.getByText(`ようこそ、${user.name}さん`)).toBeVisible({
        timeout: 15000,
      });
    });

    test('TC-AUTH-002: 上長でログインできること', async ({ page }) => {
      const user = TEST_USERS.manager;

      await page.goto('/login', { waitUntil: 'networkidle' });

      // フォームが表示されるまで待機
      await expect(page.getByLabel('メールアドレス')).toBeVisible({
        timeout: 15000,
      });
      await page.getByLabel('メールアドレス').fill(user.email);
      await page.getByLabel('パスワード').fill(user.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // ダッシュボードへ遷移
      await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
      await expect(page.getByText(`ようこそ、${user.name}さん`)).toBeVisible({
        timeout: 15000,
      });

      // 上長専用の「承認待ち日報」セクションが表示されることを確認
      await expect(page.getByText('承認待ち日報')).toBeVisible();

      // サイドバーに「営業一覧」メニューが表示されることを確認（上長のみ）
      await expect(page.getByRole('link', { name: '営業一覧' })).toBeVisible();
    });

    test('TC-AUTH-003: 無効な資格情報ではログインできないこと', async ({
      page,
    }) => {
      await page.goto('/login', { waitUntil: 'networkidle' });
      await expect(page.getByLabel('メールアドレス')).toBeVisible({
        timeout: 15000,
      });

      await page.getByLabel('メールアドレス').fill('invalid@example.com');
      await page.getByLabel('パスワード').fill('wrongpassword');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // エラーメッセージが表示されることを確認
      await expect(
        page.getByText('メールアドレスまたはパスワードが正しくありません')
      ).toBeVisible();

      // ログイン画面に留まることを確認
      await expect(page).toHaveURL('/login');
    });

    test('TC-AUTH-004: メールアドレス未入力でエラーが表示されること', async ({
      page,
    }) => {
      await page.goto('/login', { waitUntil: 'networkidle' });
      await expect(page.getByLabel('パスワード')).toBeVisible({
        timeout: 15000,
      });

      // パスワードのみ入力
      await page.getByLabel('パスワード').fill('password123');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // バリデーションエラーが表示されることを確認
      await expect(
        page.getByText('メールアドレスを入力してください')
      ).toBeVisible();
    });

    test('TC-AUTH-005: パスワード未入力でエラーが表示されること', async ({
      page,
    }) => {
      await page.goto('/login', { waitUntil: 'networkidle' });
      await expect(page.getByLabel('メールアドレス')).toBeVisible({
        timeout: 15000,
      });

      // メールアドレスのみ入力
      await page.getByLabel('メールアドレス').fill('sales1@example.com');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // バリデーションエラーが表示されることを確認
      await expect(
        page.getByText('パスワードを入力してください')
      ).toBeVisible();
    });

    test('TC-AUTH-006: 無効なメールアドレス形式でエラーが表示されること', async ({
      page,
    }) => {
      await page.goto('/login', { waitUntil: 'networkidle' });
      await expect(page.getByLabel('メールアドレス')).toBeVisible({
        timeout: 15000,
      });

      await page.getByLabel('メールアドレス').fill('invalid-email');
      await page.getByLabel('パスワード').fill('password123');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // バリデーションエラーが表示されることを確認
      await expect(
        page.getByText('有効なメールアドレスを入力してください')
      ).toBeVisible();
    });
  });

  test.describe('ログアウト', () => {
    test('TC-AUTH-007: ログアウトできること', async ({ page }) => {
      // ログイン
      await login(page, 'sales1');

      // ログアウトボタンをクリック
      await page.getByRole('button', { name: 'ログアウト' }).click();

      // ログイン画面へ遷移することを確認
      await expect(page).toHaveURL(/\/login(\?.*)?$/);

      // ログインフォームが表示されることを確認
      await expect(page.getByLabel('メールアドレス')).toBeVisible();
    });

    test('TC-AUTH-008: ログアウト後にブラウザバックでダッシュボードに戻れないこと', async ({
      page,
    }) => {
      // ログイン
      await login(page, 'sales1');

      // ログアウト
      await logout(page);

      // ブラウザバック
      await page.goBack();

      // ログイン画面にリダイレクトされることを確認
      await expect(page).toHaveURL(/\/login(\?.*)?$/);
    });
  });

  test.describe('未認証アクセス', () => {
    test('TC-AUTH-009: 未認証時にダッシュボードにアクセスするとログイン画面へリダイレクトされること', async ({
      page,
    }) => {
      await page.goto('/dashboard');
      // クエリパラメータ（callbackUrl）が付く場合があるため正規表現でマッチ
      await expect(page).toHaveURL(/\/login(\?.*)?$/);
    });

    test('TC-AUTH-010: 未認証時に日報一覧にアクセスするとログイン画面へリダイレクトされること', async ({
      page,
    }) => {
      await page.goto('/reports');
      // クエリパラメータ（callbackUrl）が付く場合があるため正規表現でマッチ
      await expect(page).toHaveURL(/\/login(\?.*)?$/);
    });

    test('TC-AUTH-011: 未認証時に顧客一覧にアクセスするとログイン画面へリダイレクトされること', async ({
      page,
    }) => {
      await page.goto('/customers');
      // クエリパラメータ（callbackUrl）が付く場合があるため正規表現でマッチ
      await expect(page).toHaveURL(/\/login(\?.*)?$/);
    });
  });
});
