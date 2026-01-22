/**
 * 監査ログモジュール
 *
 * ユーザーの認証イベントを記録するためのユーティリティ
 */

/**
 * 監査ログのアクション種別
 */
export const AuditAction = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/**
 * 監査ログのパラメータ
 */
export interface AuditLogParams {
  action: AuditActionType;
  email?: string | null;
  salesId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  resource?: string | null;
  details?: string | null;
}

/**
 * 監査ログを記録する
 *
 * 現在はコンソールログとして出力。
 * 将来的にはデータベースや外部サービスへの記録に拡張可能。
 *
 * @param params 監査ログのパラメータ
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...params,
  };

  // 本番環境ではJSON形式でログ出力（ログ収集サービスで解析しやすい形式）
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({ type: 'AUDIT_LOG', ...logEntry }));
  } else {
    // 開発環境では読みやすい形式で出力
    console.log(`[AUDIT] ${timestamp} - ${params.action}`, {
      email: params.email,
      salesId: params.salesId,
      resource: params.resource,
      details: params.details,
    });
  }

  // TODO: 将来的にはPrismaで監査ログテーブルに記録
  // await prisma.auditLog.create({ data: logEntry });
}

/**
 * ログインイベントを記録
 */
export async function logLogin(
  email: string,
  salesId: number,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  await logAudit({
    action: AuditAction.LOGIN,
    email,
    salesId,
    ipAddress,
    userAgent,
  });
}

/**
 * ログアウトイベントを記録
 */
export async function logLogout(
  email?: string | null,
  salesId?: number | null
): Promise<void> {
  await logAudit({
    action: AuditAction.LOGOUT,
    email,
    salesId,
  });
}

/**
 * ログイン失敗イベントを記録
 */
export async function logLoginFailed(
  email: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  details?: string | null
): Promise<void> {
  await logAudit({
    action: AuditAction.LOGIN_FAILED,
    email,
    ipAddress,
    userAgent,
    details,
  });
}

/**
 * 未認証アクセスイベントを記録
 */
export async function logUnauthorizedAccess(
  resource: string,
  ipAddress?: string | null
): Promise<void> {
  await logAudit({
    action: AuditAction.UNAUTHORIZED_ACCESS,
    resource,
    ipAddress,
  });
}

/**
 * 権限不足イベントを記録
 */
export async function logPermissionDenied(
  email: string | null,
  salesId: number | null,
  resource: string
): Promise<void> {
  await logAudit({
    action: AuditAction.PERMISSION_DENIED,
    email,
    salesId,
    resource,
  });
}
