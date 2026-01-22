/**
 * 権限チェック関数
 */

import { ROLES, type Role } from '../constants';
import type { SessionUser } from '../auth';

/**
 * ユーザーが上長かどうかを判定
 */
export function isManager(user: SessionUser | null | undefined): boolean {
  return user?.role === ROLES.MANAGER;
}

/**
 * ユーザーが一般営業かどうかを判定
 */
export function isSalesStaff(user: SessionUser | null | undefined): boolean {
  return user?.role === ROLES.SALES;
}

/**
 * 指定されたロールを持っているかを判定
 */
export function hasRole(
  user: SessionUser | null | undefined,
  role: Role
): boolean {
  return user?.role === role;
}

/**
 * 指定されたロールのいずれかを持っているかを判定
 */
export function hasAnyRole(
  user: SessionUser | null | undefined,
  roles: Role[]
): boolean {
  return user?.role != null && roles.includes(user.role as Role);
}

/**
 * 自分の日報かどうかを判定
 */
export function isOwnReport(
  user: SessionUser | null | undefined,
  reportSalesId: number
): boolean {
  return user?.salesId === reportSalesId;
}

/**
 * 日報を閲覧できるかどうかを判定
 * - 自分の日報は閲覧可能
 * - 上長は配下メンバーの日報を閲覧可能
 */
export function canViewReport(
  user: SessionUser | null | undefined,
  reportSalesId: number,
  isSubordinate: boolean = false
): boolean {
  if (!user) return false;

  // 自分の日報は閲覧可能
  if (isOwnReport(user, reportSalesId)) {
    return true;
  }

  // 上長は配下メンバーの日報を閲覧可能
  if (isManager(user) && isSubordinate) {
    return true;
  }

  return false;
}

/**
 * 日報を編集できるかどうかを判定
 * - 自分の日報のみ編集可能
 * - 下書きまたは差し戻し状態のみ編集可能
 */
export function canEditReport(
  user: SessionUser | null | undefined,
  reportSalesId: number,
  status: string
): boolean {
  if (!user) return false;

  // 自分の日報のみ編集可能
  if (!isOwnReport(user, reportSalesId)) {
    return false;
  }

  // 下書きまたは差し戻し状態のみ編集可能
  const editableStatuses = ['下書き', '差し戻し'];
  return editableStatuses.includes(status);
}

/**
 * 日報を削除できるかどうかを判定
 * - 自分の下書き日報のみ削除可能
 */
export function canDeleteReport(
  user: SessionUser | null | undefined,
  reportSalesId: number,
  status: string
): boolean {
  if (!user) return false;

  // 自分の日報のみ削除可能
  if (!isOwnReport(user, reportSalesId)) {
    return false;
  }

  // 下書き状態のみ削除可能
  return status === '下書き';
}

/**
 * 日報を承認/差し戻しできるかどうかを判定
 * - 上長のみ可能
 * - 配下メンバーの日報のみ可能
 * - 提出済み状態のみ可能
 */
export function canApproveReport(
  user: SessionUser | null | undefined,
  reportSalesId: number,
  status: string,
  isSubordinate: boolean = false
): boolean {
  if (!user) return false;

  // 上長のみ可能
  if (!isManager(user)) {
    return false;
  }

  // 自分の日報は承認不可
  if (isOwnReport(user, reportSalesId)) {
    return false;
  }

  // 配下メンバーの日報のみ可能
  if (!isSubordinate) {
    return false;
  }

  // 提出済み状態のみ可能
  return status === '提出済み';
}

/**
 * 営業マスタを閲覧できるかどうかを判定
 * - 上長のみ可能
 */
export function canViewSalesMaster(
  user: SessionUser | null | undefined
): boolean {
  return isManager(user);
}

/**
 * 営業マスタを編集できるかどうかを判定
 * - 上長のみ可能
 */
export function canEditSalesMaster(
  user: SessionUser | null | undefined
): boolean {
  return isManager(user);
}

/**
 * 顧客マスタを編集できるかどうかを判定
 * - 全員可能
 */
export function canEditCustomerMaster(
  user: SessionUser | null | undefined
): boolean {
  return user != null;
}

/**
 * コメントを投稿できるかどうかを判定
 * - 日報を閲覧できるユーザーは投稿可能
 */
export function canPostComment(
  user: SessionUser | null | undefined,
  reportSalesId: number,
  isSubordinate: boolean = false
): boolean {
  return canViewReport(user, reportSalesId, isSubordinate);
}

/**
 * コメントを削除できるかどうかを判定
 * - 自分のコメントのみ削除可能
 */
export function canDeleteComment(
  user: SessionUser | null | undefined,
  commentSalesId: number
): boolean {
  if (!user) return false;
  return user.salesId === commentSalesId;
}

/**
 * ロール値が有効かどうかを判定
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}
