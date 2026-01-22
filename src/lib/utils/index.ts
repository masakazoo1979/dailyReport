/**
 * ユーティリティ関数のエクスポート
 */

// 日付ユーティリティ
export {
  getTodayJST,
  getFirstDayOfMonthJST,
  getLastDayOfMonthJST,
  formatDate,
  formatDateForApi,
  formatTime,
  formatDateJapanese,
  formatDateTime,
  parseDate,
  isSameDate,
  isToday,
  formatRelativeTime,
  getDayOfWeek,
  formatDateWithDayOfWeek,
} from './date';

// ステータスヘルパー
export {
  getStatusColor,
  getStatusBadgeClass,
  getStatusIcon,
  isStatusEditable,
  isStatusSubmittable,
  isStatusApprovable,
  getStatusDescription,
  getNextAvailableStatuses,
  isValidStatus,
  toReportStatus,
} from './status';

// 権限チェック
export {
  isManager,
  isSalesStaff,
  hasRole,
  hasAnyRole,
  isOwnReport,
  canViewReport,
  canEditReport,
  canDeleteReport,
  canApproveReport,
  canViewSalesMaster,
  canEditSalesMaster,
  canEditCustomerMaster,
  canPostComment,
  canDeleteComment,
  isValidRole,
} from './permissions';

// エラーハンドリング
export {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  DuplicateError,
  fromZodError,
  getErrorMessage,
  getErrorStatusCode,
  getErrorCode,
  formatErrorForLog,
  isRetryableError,
  toUserFriendlyMessage,
} from './error';

// API応答ヘルパー
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiListResponse,
  PaginationMeta,
} from './api';
export {
  createSuccessResponse,
  createListResponse,
  createCreatedResponse,
  createDeletedResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createNotFoundResponse,
  createValidationErrorResponse,
  calculatePagination,
  parseRequestBody,
  getIdFromParams,
  getQueryParams,
  getPaginationParams,
} from './api';
