import { z } from 'zod';

/**
 * 訪問記録スキーマ
 *
 * 画面項目:
 * - DR-005: 訪問時刻（必須、HH:MM形式）
 * - DR-006: 顧客（必須）
 * - DR-007: 訪問内容（必須、1000文字以内）
 */
export const visitRecordSchema = z.object({
  visitTime: z
    .string()
    .min(1, '訪問時刻を入力してください') // E-009
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      '訪問時刻の形式が正しくありません。（HH:MM形式で入力してください）'
    ), // E-010
  customerId: z
    .number({
      required_error: '顧客を選択してください', // E-011
      invalid_type_error: '顧客を選択してください', // E-011
    })
    .int()
    .positive('顧客を選択してください'), // E-011
  visitContent: z
    .string()
    .min(1, '訪問内容を入力してください') // E-012
    .max(1000, '訪問内容は1000文字以内で入力してください'), // E-013
});

export type VisitRecordInput = z.infer<typeof visitRecordSchema>;

/**
 * 訪問記録スキーマ（編集用・IDあり）
 */
export const visitRecordWithIdSchema = visitRecordSchema.extend({
  visitId: z.number().int().positive().optional(),
});

export type VisitRecordWithIdInput = z.infer<typeof visitRecordWithIdSchema>;

/**
 * 日報登録・編集スキーマ
 *
 * 画面項目:
 * - DR-001: 報告日（必須）
 * - DR-008: 課題・相談（任意、2000文字以内）
 * - DR-009: 明日の予定（任意、2000文字以内）
 */
export const dailyReportSchema = z.object({
  reportDate: z
    .string()
    .min(1, '報告日を選択してください') // E-007
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'), // E-005
  problem: z
    .string()
    .max(2000, '課題・相談は2000文字以内で入力してください') // E-014
    .optional()
    .nullable(),
  plan: z
    .string()
    .max(2000, '明日の予定は2000文字以内で入力してください') // E-015
    .optional()
    .nullable(),
  visits: z
    .array(visitRecordWithIdSchema)
    .min(0, '訪問記録を追加してください')
    .default([]),
});

export type DailyReportInput = z.infer<typeof dailyReportSchema>;

/**
 * 日報提出スキーマ（訪問記録1件以上必須）
 */
export const dailyReportSubmitSchema = dailyReportSchema.extend({
  visits: z
    .array(visitRecordWithIdSchema)
    .min(1, '日報を提出するには、訪問記録を1件以上登録してください'), // E-016
});

export type DailyReportSubmitInput = z.infer<typeof dailyReportSubmitSchema>;

/**
 * 日報作成リクエストスキーマ（API用）
 */
export const createDailyReportSchema = z.object({
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  problem: z.string().max(2000).optional().nullable(),
  plan: z.string().max(2000).optional().nullable(),
  status: z.enum(['下書き', '提出済み']),
});

export type CreateDailyReportRequest = z.infer<typeof createDailyReportSchema>;

/**
 * 日報更新リクエストスキーマ（API用）
 */
export const updateDailyReportSchema = z.object({
  problem: z.string().max(2000).optional().nullable(),
  plan: z.string().max(2000).optional().nullable(),
});

export type UpdateDailyReportRequest = z.infer<typeof updateDailyReportSchema>;

/**
 * 訪問記録作成リクエストスキーマ（API用）
 */
export const createVisitSchema = z.object({
  customerId: z.number().int().positive(),
  visitTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  visitContent: z.string().min(1).max(1000),
});

export type CreateVisitRequest = z.infer<typeof createVisitSchema>;

/**
 * 訪問記録更新リクエストスキーマ（API用）
 */
export const updateVisitSchema = createVisitSchema.partial();

export type UpdateVisitRequest = z.infer<typeof updateVisitSchema>;

/**
 * 日報レスポンススキーマ
 */
export const dailyReportResponseSchema = z.object({
  reportId: z.number(),
  salesId: z.number(),
  salesName: z.string(),
  department: z.string().optional(),
  reportDate: z.string(),
  problem: z.string().nullable(),
  plan: z.string().nullable(),
  status: z.enum(['下書き', '提出済み', '承認済み', '差し戻し']),
  submittedAt: z.string().nullable(),
  approvedAt: z.string().nullable(),
  approvedBy: z.number().nullable(),
  approvedByName: z.string().nullable(),
  visits: z.array(
    z.object({
      visitId: z.number(),
      customerId: z.number(),
      customerName: z.string(),
      companyName: z.string(),
      visitTime: z.string(),
      visitContent: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
  comments: z
    .array(
      z.object({
        commentId: z.number(),
        salesId: z.number(),
        salesName: z.string(),
        commentContent: z.string(),
        createdAt: z.string(),
      })
    )
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DailyReportResponse = z.infer<typeof dailyReportResponseSchema>;
