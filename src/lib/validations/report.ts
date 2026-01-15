import { z } from 'zod';

/**
 * 訪問時刻のバリデーション（HH:MM形式）
 */
const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

/**
 * 訪問記録のバリデーションスキーマ
 */
export const visitSchema = z.object({
  visitTime: z
    .string()
    .min(1, '訪問時刻を入力してください')
    .regex(timeRegex, '訪問時刻はHH:MM形式で入力してください（例: 14:30）'),
  customerId: z
    .number({
      required_error: '顧客を選択してください',
      invalid_type_error: '顧客を選択してください',
    })
    .int('顧客を選択してください')
    .positive('顧客を選択してください'),
  visitContent: z
    .string()
    .min(1, '訪問内容を入力してください')
    .max(1000, '訪問内容は1000文字以内で入力してください'),
});

/**
 * 日報登録フォームのバリデーションスキーマ
 */
export const reportFormSchema = z.object({
  reportDate: z.date({
    required_error: '報告日を選択してください',
    invalid_type_error: '報告日の形式が正しくありません',
  }),
  visits: z.array(visitSchema).min(0, '訪問記録は0件以上である必要があります'),
  problem: z
    .string()
    .max(2000, '課題・相談は2000文字以内で入力してください')
    .optional()
    .nullable(),
  plan: z
    .string()
    .max(2000, '明日の予定は2000文字以内で入力してください')
    .optional()
    .nullable(),
});

/**
 * 日報提出時のバリデーションスキーマ（訪問記録1件以上必須）
 */
export const reportSubmitSchema = reportFormSchema.extend({
  visits: z
    .array(visitSchema)
    .min(1, '日報を提出するには、訪問記録を1件以上追加してください'),
});

/**
 * 日報作成APIリクエストのバリデーションスキーマ
 */
export const createReportSchema = z.object({
  reportDate: z.string().min(1, '報告日を入力してください'),
  problem: z
    .string()
    .max(2000, '課題・相談は2000文字以内で入力してください')
    .optional()
    .nullable(),
  plan: z
    .string()
    .max(2000, '明日の予定は2000文字以内で入力してください')
    .optional()
    .nullable(),
  status: z.enum(['下書き', '提出済み'], {
    errorMap: () => ({
      message: 'ステータスは「下書き」または「提出済み」を選択してください',
    }),
  }),
  visits: z
    .array(
      z.object({
        visitTime: z
          .string()
          .min(1, '訪問時刻を入力してください')
          .regex(timeRegex, '訪問時刻はHH:MM形式で入力してください'),
        customerId: z.number().int().positive(),
        visitContent: z
          .string()
          .min(1, '訪問内容を入力してください')
          .max(1000, '訪問内容は1000文字以内で入力してください'),
      })
    )
    .optional(),
});

/**
 * 型定義
 */
export type VisitInput = z.infer<typeof visitSchema>;
export type ReportFormInput = z.infer<typeof reportFormSchema>;
export type ReportSubmitInput = z.infer<typeof reportSubmitSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
