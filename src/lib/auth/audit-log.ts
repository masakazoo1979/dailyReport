import { prisma } from "../prisma";

/**
 * 監査ログのアクション種別
 */
export enum AuditAction {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INVALID_ROLE = "INVALID_ROLE",
}

/**
 * 監査ログのエントリ
 */
export interface AuditLogEntry {
  action: AuditAction;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

/**
 * 監査ログを記録する
 * @param entry - 監査ログエントリ
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        email: entry.email,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        details: entry.details ? JSON.stringify(entry.details) : null,
      },
    });
  } catch (error) {
    // 監査ログの記録失敗はアプリケーションの処理を中断しない
    // ただし、ログには記録する
    console.error("Failed to write audit log:", error);
  }
}

/**
 * ログイン成功を記録する
 * @param email - メールアドレス
 * @param ipAddress - IPアドレス
 * @param userAgent - ユーザーエージェント
 */
export async function logLoginSuccess(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    action: AuditAction.LOGIN_SUCCESS,
    email,
    ipAddress,
    userAgent,
  });
}

/**
 * ログイン失敗を記録する
 * @param email - メールアドレス
 * @param reason - 失敗理由
 * @param ipAddress - IPアドレス
 * @param userAgent - ユーザーエージェント
 */
export async function logLoginFailed(
  email: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    action: AuditAction.LOGIN_FAILED,
    email,
    ipAddress,
    userAgent,
    details: { reason },
  });
}
