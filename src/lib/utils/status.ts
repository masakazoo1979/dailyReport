/**
 * ステータス表示ヘルパー関数
 */

import { REPORT_STATUSES, type ReportStatus } from '../constants';

/**
 * ステータスの表示色を取得
 */
export function getStatusColor(
  status: ReportStatus
): 'default' | 'secondary' | 'destructive' | 'success' {
  switch (status) {
    case REPORT_STATUSES.DRAFT:
      return 'secondary';
    case REPORT_STATUSES.SUBMITTED:
      return 'default';
    case REPORT_STATUSES.APPROVED:
      return 'success';
    case REPORT_STATUSES.REJECTED:
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * ステータスのバッジ用CSSクラスを取得
 */
export function getStatusBadgeClass(status: ReportStatus): string {
  switch (status) {
    case REPORT_STATUSES.DRAFT:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case REPORT_STATUSES.SUBMITTED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case REPORT_STATUSES.APPROVED:
      return 'bg-green-100 text-green-800 border-green-200';
    case REPORT_STATUSES.REJECTED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * ステータスのアイコン名を取得
 */
export function getStatusIcon(status: ReportStatus): string {
  switch (status) {
    case REPORT_STATUSES.DRAFT:
      return 'file-edit';
    case REPORT_STATUSES.SUBMITTED:
      return 'send';
    case REPORT_STATUSES.APPROVED:
      return 'check-circle';
    case REPORT_STATUSES.REJECTED:
      return 'x-circle';
    default:
      return 'file';
  }
}

/**
 * ステータスが編集可能かどうかを判定
 */
export function isStatusEditable(status: ReportStatus): boolean {
  return (
    status === REPORT_STATUSES.DRAFT || status === REPORT_STATUSES.REJECTED
  );
}

/**
 * ステータスが提出可能かどうかを判定
 */
export function isStatusSubmittable(status: ReportStatus): boolean {
  return (
    status === REPORT_STATUSES.DRAFT || status === REPORT_STATUSES.REJECTED
  );
}

/**
 * ステータスが承認/差し戻し可能かどうかを判定
 */
export function isStatusApprovable(status: ReportStatus): boolean {
  return status === REPORT_STATUSES.SUBMITTED;
}

/**
 * ステータスの説明テキストを取得
 */
export function getStatusDescription(status: ReportStatus): string {
  switch (status) {
    case REPORT_STATUSES.DRAFT:
      return '下書き状態です。提出するまで上長には表示されません。';
    case REPORT_STATUSES.SUBMITTED:
      return '上長の承認待ちです。';
    case REPORT_STATUSES.APPROVED:
      return '承認済みです。';
    case REPORT_STATUSES.REJECTED:
      return '差し戻されました。内容を修正して再提出してください。';
    default:
      return '';
  }
}

/**
 * 次に遷移可能なステータス一覧を取得
 */
export function getNextAvailableStatuses(
  currentStatus: ReportStatus,
  isManager: boolean
): ReportStatus[] {
  switch (currentStatus) {
    case REPORT_STATUSES.DRAFT:
      return [REPORT_STATUSES.SUBMITTED];
    case REPORT_STATUSES.SUBMITTED:
      if (isManager) {
        return [REPORT_STATUSES.APPROVED, REPORT_STATUSES.REJECTED];
      }
      return [];
    case REPORT_STATUSES.REJECTED:
      return [REPORT_STATUSES.SUBMITTED];
    case REPORT_STATUSES.APPROVED:
      return [];
    default:
      return [];
  }
}

/**
 * ステータス値が有効かどうかを判定
 */
export function isValidStatus(status: string): status is ReportStatus {
  return Object.values(REPORT_STATUSES).includes(status as ReportStatus);
}

/**
 * ステータスをReportStatus型に変換（無効な場合はnullを返す）
 */
export function toReportStatus(status: string): ReportStatus | null {
  if (isValidStatus(status)) {
    return status;
  }
  return null;
}
