/**
 * バリデーションスキーマ一括エクスポート
 *
 * フロントエンドとバックエンドで共有できる
 * Zodバリデーションスキーマを提供します。
 */

import { z } from 'zod';
import { japaneseErrorMap } from './common';

/**
 * Zodのグローバルエラーマップを日本語に設定する
 * アプリケーション初期化時に呼び出してください
 *
 * @example
 * // app/layout.tsx または providers.tsx で
 * import { setupJapaneseErrorMap } from '@/lib/validations';
 * setupJapaneseErrorMap();
 */
export function setupJapaneseErrorMap(): void {
  z.setErrorMap(japaneseErrorMap);
}

// 共通バリデーション
export {
  emailSchema,
  passwordSchema,
  phoneRegex,
  phoneSchema,
  timeRegex,
  timeSchema,
  dateRegex,
  dateStringSchema,
  idSchema,
  optionalIdSchema,
  paginationSchema,
  sortSchema,
  dateRangeSchema,
  createTextSchema,
  japaneseErrorMap,
} from './common';
export type { PaginationInput, SortInput, DateRangeInput } from './common';

// 認証バリデーション
export {
  loginSchema,
  passwordSchema as authPasswordSchema,
  registerSchema,
  changePasswordSchema,
} from './auth';
export type { LoginInput, RegisterInput, ChangePasswordInput } from './auth';

// 日報バリデーション
export {
  reportStatusSchema,
  createReportStatusSchema,
  problemSchema,
  planSchema,
  dailyReportFormSchema,
  dailyReportSubmitSchema,
  createDailyReportSchema,
  updateDailyReportSchema,
  dailyReportSearchSchema,
  submitDailyReportSchema,
  approveDailyReportSchema,
  rejectDailyReportSchema,
} from './daily-report';
export type {
  ReportStatus,
  DailyReportFormInput,
  DailyReportSubmitInput,
  CreateDailyReportInput,
  UpdateDailyReportInput,
  DailyReportSearchInput,
  RejectDailyReportInput,
} from './daily-report';

// 訪問記録バリデーション
export {
  visitTimeSchema,
  visitFormSchema,
  createVisitSchema,
  updateVisitSchema,
  visitsArraySchema,
  visitsRequiredArraySchema,
} from './visit';
export type {
  VisitFormInput,
  CreateVisitInput,
  UpdateVisitInput,
} from './visit';

// コメントバリデーション
export {
  commentContentSchema,
  commentFormSchema,
  createCommentSchema,
  rejectCommentSchema,
} from './comment';
export type {
  CommentFormInput,
  CreateCommentInput,
  RejectCommentInput,
} from './comment';

// 顧客バリデーション
export {
  customerFormSchema,
  createCustomerSchema,
  updateCustomerSchema,
} from './customer';
export type {
  CustomerFormInput,
  CreateCustomerInput,
  UpdateCustomerInput,
} from './customer';

// 営業担当者バリデーション
export { salesFormSchema, createSalesSchema, updateSalesSchema } from './sales';
export type {
  SalesFormInput,
  CreateSalesInput,
  UpdateSalesInput,
} from './sales';

// 後方互換性のため、既存のreport.tsからもエクスポート
// （既存コードが report.ts を参照している場合の移行対応）
export {
  visitSchema,
  reportFormSchema,
  reportSubmitSchema,
  createReportSchema,
  updateReportSchema,
} from './report';
export type {
  VisitInput,
  ReportFormInput,
  ReportSubmitInput,
  CreateReportInput,
  UpdateReportInput,
} from './report';
