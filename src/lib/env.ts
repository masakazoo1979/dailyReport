import { z } from 'zod';

/**
 * 環境変数のスキーマ定義
 *
 * Zodを使用して環境変数を型安全に管理し、
 * 起動時に必須変数の存在と形式を検証する
 */

// サーバーサイド専用の環境変数スキーマ
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url('DATABASE_URLは有効なURLである必要があります')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URLはPostgreSQLの接続文字列である必要があります'
    ),

  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // NextAuth.js
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URLは有効なURLである必要があります')
    .optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRETは32文字以上である必要があります'),

  // Optional: CI環境
  CI: z.string().optional(),
});

// クライアントサイドで使用可能な環境変数スキーマ
// NEXT_PUBLIC_ プレフィックスを持つ変数のみ
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// 型定義のエクスポート
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * 環境変数をパースして検証する
 * サーバーサイドでのみ呼び出し可能
 */
function parseServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('環境変数の検証に失敗しました:\n' + formattedErrors);

    // 開発環境では警告のみ（CI環境を考慮）
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.CI !== 'true' &&
      process.env.CI !== '1'
    ) {
      throw new Error(
        '必須の環境変数が設定されていません。環境変数を確認してください。'
      );
    }

    // 開発環境ではデフォルト値を使用
    return serverEnvSchema.parse({
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/daily_report',
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '3000',
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET ||
        'development-secret-key-do-not-use-in-production',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      CI: process.env.CI,
    });
  }

  return result.data;
}

/**
 * クライアントサイド環境変数をパースする
 */
function parseClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    console.warn('クライアント環境変数の検証に失敗しました');
    return {} as ClientEnv;
  }

  return result.data;
}

// サーバーサイド環境変数（遅延評価）
let _serverEnv: ServerEnv | null = null;
export function getServerEnv(): ServerEnv {
  if (!_serverEnv) {
    _serverEnv = parseServerEnv();
  }
  return _serverEnv;
}

// クライアントサイド環境変数
export const clientEnv = parseClientEnv();

/**
 * 環境変数が本番環境かどうかを判定
 */
export function isProduction(): boolean {
  return getServerEnv().NODE_ENV === 'production';
}

/**
 * 環境変数が開発環境かどうかを判定
 */
export function isDevelopment(): boolean {
  return getServerEnv().NODE_ENV === 'development';
}

/**
 * 環境変数がテスト環境かどうかを判定
 */
export function isTest(): boolean {
  return getServerEnv().NODE_ENV === 'test';
}
