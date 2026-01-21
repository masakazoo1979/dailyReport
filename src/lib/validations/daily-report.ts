import { z } from 'zod';
import { REPORT_STATUSES } from '@/lib/constants';
import { dateStringSchema, optionalIdSchema } from './common';
import {
  visitFormSchema,
  visitsRequiredArraySchema,
  createVisitSchema,
} from './visit';

/**
 * 日報ステータスのバリデーションスキーマ
 */
export const reportStatusSchema = z.enum(
  [
    REPORT_STATUSES.DRAFT,
    REPORT_STATUSES.SUBMITTED,
    REPORT_STATUSES.APPROVED,
    REPORT_STATUSES.REJECTED,
  ],
  {
    errorMap: () => ({
      message: '有効なステータスを選択してください',
    }),
  }
);

/**
 * 日報作成時のステータススキーマ（下書きまたは提出済みのみ）
 */
export const createReportStatusSchema = z.enum(
  [REPORT_STATUSES.DRAFT, REPORT_STATUSES.SUBMITTED],
  {
    errorMap: () => ({
      message: 'ステータスは「下書き」または「提出済み」を選択してください',
    }),
  }
);

/**
 * 課題・相談フィールドのバリデーションスキーマ
 */
export const problemSchema = z
  .string()
  .max(2000, '課題・相談は2000文字以内で入力してください')
  .optional()
  .nullable()
  .or(z.literal(''));

/**
 * 明日の予定フィールドのバリデーションスキーマ
 */
export const planSchema = z
  .string()
  .max(2000, '明日の予定は2000文字以内で入力してください')
  .optional()
  .nullable()
  .or(z.literal(''));

/**
 * 日報登録フォームのバリデーションスキーマ
 */
export const dailyReportFormSchema = z.object({
  reportDate: z.date({
    required_error: '報告日を選択してください',
    invalid_type_error: '報告日の形式が正しくありません',
  }),
  visits: z
    .array(visitFormSchema)
    .min(0, '訪問記録は0件以上である必要があります'),
  problem: problemSchema,
  plan: planSchema,
});

/**
 * 日報提出時のバリデーションスキーマ（訪問記録1件以上必須）
 */
export const dailyReportSubmitSchema = dailyReportFormSchema.extend({
  visits: visitsRequiredArraySchema,
});

/**
 * 日報作成APIリクエストのバリデーションスキーマ
 */
export const createDailyReportSchema = z.object({
  reportDate: dateStringSchema,
  problem: problemSchema,
  plan: planSchema,
  status: createReportStatusSchema,
  visits: z.array(createVisitSchema).optional(),
});

/**
 * 日報更新APIリクエストのバリデーションスキーマ
 */
export const updateDailyReportSchema = z.object({
  problem: problemSchema,
  plan: planSchema,
  status: z
    .enum(
      [
        REPORT_STATUSES.DRAFT,
        REPORT_STATUSES.SUBMITTED,
        REPORT_STATUSES.REJECTED,
      ],
      {
        errorMap: () => ({
          message:
            'ステータスは「下書き」、「提出済み」、または「差し戻し」を選択してください',
        }),
      }
    )
    .optional(),
  visits: z.array(createVisitSchema).optional(),
});

/**
 * 日報一覧検索パラメータのバリデーションスキーマ
 */
export const dailyReportSearchSchema = z
  .object({
    startDate: dateStringSchema.optional().nullable(),
    endDate: dateStringSchema.optional().nullable(),
    salesId: optionalIdSchema,
    status: reportStatusSchema.optional().nullable(),
    page: z.number().int().min(1).default(1),
    perPage: z.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: '終了日は開始日以降の日付を指定してください',
      path: ['endDate'],
    }
  );

/**
 * 日報提出APIリクエストのバリデーションスキーマ
 */
export const submitDailyReportSchema = z.object({
  // リクエストボディは空でもOK
});

/**
 * 日報承認APIリクエストのバリデーションスキーマ
 */
export const approveDailyReportSchema = z.object({
  // リクエストボディは空でもOK
});

/**
 * 日報差し戻しAPIリクエストのバリデーションスキーマ
 */
export const rejectDailyReportSchema = z.object({
  comment: z
    .string()
    .max(1000, 'コメントは1000文字以内で入力してください')
    .optional()
    .nullable(),
});

/**
 * 型定義
 */
export type ReportStatus = z.infer<typeof reportStatusSchema>;
export type DailyReportFormInput = z.infer<typeof dailyReportFormSchema>;
export type DailyReportSubmitInput = z.infer<typeof dailyReportSubmitSchema>;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
export type UpdateDailyReportInput = z.infer<typeof updateDailyReportSchema>;
export type DailyReportSearchInput = z.infer<typeof dailyReportSearchSchema>;
export type RejectDailyReportInput = z.infer<typeof rejectDailyReportSchema>;
