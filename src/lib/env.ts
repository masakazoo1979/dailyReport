/**
 * 環境変数の検証と型定義
 */

let isValidated = false;

/**
 * 必須環境変数を検証する
 * @throws {Error} 必須環境変数が設定されていない場合
 */
export function validateEnv(): void {
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ] as const;

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        `Please check your .env file and ensure all required variables are set.`
    );
  }

  // NEXTAUTH_SECRETの最小長チェック（セキュリティ）
  if (process.env.NEXTAUTH_SECRET!.length < 32) {
    throw new Error(
      "NEXTAUTH_SECRET must be at least 32 characters long for security"
    );
  }

  isValidated = true;
}

/**
 * 型安全な環境変数アクセス
 * @throws {Error} validateEnv()が呼ばれていない場合
 */
export function getEnv() {
  if (!isValidated) {
    throw new Error(
      "Environment variables not validated. Call validateEnv() first."
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NODE_ENV: process.env.NODE_ENV || "development",
  } as const;
}
