/**
 * 認証関連の定数
 */
export const AUTH_CONSTANTS = {
  /**
   * bcryptのソルトラウンド数
   */
  SALT_ROUNDS: 10,

  /**
   * セッションの最大有効期限（秒）
   * 30日 = 30 * 24 * 60 * 60
   */
  SESSION_MAX_AGE_SECONDS: 30 * 24 * 60 * 60,

  /**
   * セッション更新間隔（秒）
   * 1日 = 24 * 60 * 60
   */
  SESSION_UPDATE_AGE_SECONDS: 24 * 60 * 60,

  /**
   * タイミング攻撃対策用のダミーハッシュ
   * ユーザーが存在しない場合でも処理時間を均一化するために使用
   */
  DUMMY_PASSWORD_HASH: "$2a$10$dummyhashforobfuscationtimingattackprotection",

  /**
   * レート制限 - 時間ウィンドウ（ミリ秒）
   * 15分 = 15 * 60 * 1000
   */
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,

  /**
   * レート制限 - ウィンドウ内の最大リクエスト数
   */
  RATE_LIMIT_MAX_REQUESTS: 5,
} as const;
