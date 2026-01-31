/**
 * APIレート制限ユーティリティ
 *
 * ブルートフォース攻撃やDoS攻撃からの保護
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil?: number;
}

// メモリ内でレート制限を管理（本番環境ではRedis等を使用推奨）
const rateLimitStore = new Map<string, RateLimitEntry>();

// レート制限の設定
export interface RateLimitConfig {
  windowMs: number; // 時間窓（ミリ秒）
  maxRequests: number; // 最大リクエスト数
  blockDurationMs?: number; // ブロック期間（ミリ秒）
}

// デフォルト設定
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分
  maxRequests: 100, // 100リクエスト/分
  blockDurationMs: 60 * 1000, // 1分間ブロック
};

// ログイン試行用の厳しい制限
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分
  maxRequests: 5, // 5回
  blockDurationMs: 15 * 60 * 1000, // 15分間ブロック
};

// API一般用の制限
export const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分
  maxRequests: 60, // 60リクエスト/分
  blockDurationMs: 60 * 1000, // 1分間ブロック
};

/**
 * レート制限をチェックする
 *
 * @param identifier - 識別子（IPアドレスやユーザーID）
 * @param config - レート制限設定
 * @returns 許可されている場合true、制限されている場合false
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // 新規エントリの場合
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      firstRequest: now,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // ブロック中の場合
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
    };
  }

  // 時間窓がリセットされた場合
  if (now - entry.firstRequest > config.windowMs) {
    rateLimitStore.set(identifier, {
      count: 1,
      firstRequest: now,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // カウントを増加
  entry.count++;

  // 制限を超えた場合
  if (entry.count > config.maxRequests) {
    entry.blockedUntil = now + (config.blockDurationMs || config.windowMs);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.blockedUntil,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.firstRequest + config.windowMs,
  };
}

/**
 * レート制限をリセットする
 *
 * @param identifier - 識別子
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * 古いエントリをクリーンアップする
 * 定期的に実行することを推奨
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1時間

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * クライアントIPアドレスを取得する
 *
 * @param headers - リクエストヘッダー
 * @returns IPアドレス
 */
export function getClientIp(headers: Headers): string {
  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  // X-Forwarded-For（最初のIPを使用）
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    return ips[0] || 'unknown';
  }

  // X-Real-IP
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  return 'unknown';
}

// 1時間ごとにクリーンアップ
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
}
