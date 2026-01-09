import { AUTH_CONSTANTS } from "../constants/auth";

/**
 * レート制限の試行記録
 */
interface RateLimitAttempt {
  count: number;
  resetAt: number;
}

/**
 * インメモリのレート制限ストア
 * 注: プロダクションではRedisなどの永続化されたストアを使用することを推奨
 */
const rateLimitStore = new Map<string, RateLimitAttempt>();

/**
 * 期限切れのエントリをクリーンアップ
 * オンデマンドで実行されるため、定期実行は不要
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, attempt] of rateLimitStore.entries()) {
    if (now > attempt.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * レート制限をチェックする
 * @param identifier - 識別子（通常はメールアドレスまたはIPアドレス）
 * @returns レート制限を超えている場合true
 */
export function isRateLimited(identifier: string): boolean {
  // 期限切れエントリのクリーンアップ（オンデマンド実行）
  cleanupExpiredEntries();

  const now = Date.now();
  const attempt = rateLimitStore.get(identifier);

  if (!attempt) {
    // 初回試行 - まだ記録なし
    return false;
  }

  if (now > attempt.resetAt) {
    // ウィンドウがリセットされた
    return false;
  }

  // 現在のカウントをチェック（インクリメントしない）
  return attempt.count >= AUTH_CONSTANTS.RATE_LIMIT_MAX_REQUESTS;
}

/**
 * レート制限のカウントをインクリメントする（ログイン失敗時に呼ぶ）
 * @param identifier - 識別子
 */
export function incrementRateLimit(identifier: string): void {
  const now = Date.now();
  const attempt = rateLimitStore.get(identifier);

  if (!attempt || now > attempt.resetAt) {
    // 初回または期限切れ - 新しいウィンドウを開始
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + AUTH_CONSTANTS.RATE_LIMIT_WINDOW_MS,
    });
  } else {
    // ウィンドウ内でカウント増加
    attempt.count++;
  }
}

/**
 * レート制限をリセットする（ログイン成功時など）
 * @param identifier - 識別子
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * レート制限情報を取得する
 * @param identifier - 識別子
 * @returns レート制限情報
 */
export function getRateLimitInfo(identifier: string): {
  remaining: number;
  resetAt: number | null;
} {
  const attempt = rateLimitStore.get(identifier);

  if (!attempt) {
    return {
      remaining: AUTH_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
      resetAt: null,
    };
  }

  const now = Date.now();
  if (now > attempt.resetAt) {
    return {
      remaining: AUTH_CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
      resetAt: null,
    };
  }

  return {
    remaining: Math.max(0, AUTH_CONSTANTS.RATE_LIMIT_MAX_REQUESTS - attempt.count),
    resetAt: attempt.resetAt,
  };
}
