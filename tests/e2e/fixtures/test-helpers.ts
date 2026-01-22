import { Page, expect } from '@playwright/test';

/**
 * E2E テスト用のヘルパー関数
 */

/** テストユーザーの資格情報 */
export const TEST_USERS = {
  /** 上長ユーザー */
  manager: {
    email: 'manager@example.com',
    password: 'password123',
    name: '山田 太郎',
    role: '上長',
  },
  /** 一般営業ユーザー1 */
  sales1: {
    email: 'sales1@example.com',
    password: 'password123',
    name: '鈴木 一郎',
    role: '一般',
  },
  /** 一般営業ユーザー2 */
  sales2: {
    email: 'sales2@example.com',
    password: 'password123',
    name: '佐藤 花子',
    role: '一般',
  },
} as const;

export type TestUserKey = keyof typeof TEST_USERS;

/**
 * ログイン処理を実行する
 * @param page Playwright ページオブジェクト
 * @param userKey テストユーザーのキー
 */
export async function login(page: Page, userKey: TestUserKey): Promise<void> {
  const user = TEST_USERS[userKey];

  await page.goto('/login');

  // ログインフォームに入力
  await page.getByLabel('メールアドレス').fill(user.email);
  await page.getByLabel('パスワード').fill(user.password);

  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();

  // ダッシュボードへの遷移を待機
  await expect(page).toHaveURL(/\/(dashboard)?$/);
  await expect(page.getByText(`ようこそ、${user.name}さん`)).toBeVisible();
}

/**
 * ログアウト処理を実行する
 * @param page Playwright ページオブジェクト
 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await expect(page).toHaveURL('/login');
}

/**
 * サイドバーのリンクをクリックしてページ遷移する
 * @param page Playwright ページオブジェクト
 * @param linkText リンクテキスト
 */
export async function navigateTo(page: Page, linkText: string): Promise<void> {
  await page.getByRole('link', { name: linkText }).click();
}

/**
 * ページのロードを待機する
 * @param page Playwright ページオブジェクト
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * 成功メッセージが表示されるのを待機する
 * @param page Playwright ページオブジェクト
 * @param message 期待するメッセージ（部分一致）
 */
export async function expectSuccessMessage(
  page: Page,
  message: string
): Promise<void> {
  await expect(page.getByText(message)).toBeVisible({ timeout: 10000 });
}

/**
 * エラーメッセージが表示されるのを待機する
 * @param page Playwright ページオブジェクト
 * @param message 期待するメッセージ（部分一致）
 */
export async function expectErrorMessage(
  page: Page,
  message: string
): Promise<void> {
  await expect(page.getByText(message)).toBeVisible({ timeout: 10000 });
}
