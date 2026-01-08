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
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, attempt] of rateLimitStore.entries()) {
    if (now > attempt.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// 定期的にクリーンアップを実行（5分ごと）
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * レート制限をチェックする
 * @param identifier - 識別子（通常はメールアドレスまたはIPアドレス）
 * @returns レート制限を超えている場合true
 */
export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const attempt = rateLimitStore.get(identifier);

  if (!attempt) {
    // 初回試行
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + AUTH_CONSTANTS.RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (now > attempt.resetAt) {
    // ウィンドウがリセットされた
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + AUTH_CONSTANTS.RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  // ウィンドウ内で試行回数をインクリメント
  attempt.count++;

  if (attempt.count > AUTH_CONSTANTS.RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
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
