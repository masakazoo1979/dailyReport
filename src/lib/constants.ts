/**
 * アプリケーション共通定数
 */

/**
 * ユーザー権限
 */
export const ROLES = {
  MANAGER: '上長',
  SALES: '一般営業',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * 日報ステータス
 */
export const REPORT_STATUSES = {
  DRAFT: '下書き',
  SUBMITTED: '提出済み',
  APPROVED: '承認済み',
  REJECTED: '差し戻し',
} as const;

export type ReportStatus =
  (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES];
