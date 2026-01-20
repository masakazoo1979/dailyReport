import { z } from 'zod';
import { timeRegex } from './common';

/**
 * 訪問時刻のバリデーションスキーマ
 */
export const visitTimeSchema = z
  .string()
  .min(1, '訪問時刻を入力してください。')
  .regex(
    timeRegex,
    '訪問時刻の形式が正しくありません。（HH:MM形式で入力してください）'
  );

/**
 * 訪問記録フォームのバリデーションスキーマ
 */
export const visitFormSchema = z.object({
  visitTime: visitTimeSchema,
  customerId: z
    .number({
      required_error: '顧客を選択してください。',
      invalid_type_error: '顧客を選択してください。',
    })
    .int('顧客を選択してください。')
    .positive('顧客を選択してください。'),
  visitContent: z
    .string()
    .min(1, '訪問内容を入力してください。')
    .max(1000, '訪問内容は1000文字以内で入力してください。'),
});

/**
 * 訪問記録作成APIリクエストのバリデーションスキーマ
 */
export const createVisitSchema = z.object({
  customerId: z
    .number({
      required_error: '顧客IDは必須です。',
      invalid_type_error: '顧客IDは数値で指定してください。',
    })
    .int('顧客IDは整数で指定してください。')
    .positive('顧客IDは正の整数で指定してください。'),
  visitTime: visitTimeSchema,
  visitContent: z
    .string()
    .min(1, '訪問内容を入力してください。')
    .max(1000, '訪問内容は1000文字以内で入力してください。'),
});

/**
 * 訪問記録更新APIリクエストのバリデーションスキーマ
 */
export const updateVisitSchema = z.object({
  customerId: z
    .number({
      required_error: '顧客IDは必須です。',
      invalid_type_error: '顧客IDは数値で指定してください。',
    })
    .int('顧客IDは整数で指定してください。')
    .positive('顧客IDは正の整数で指定してください。'),
  visitTime: visitTimeSchema,
  visitContent: z
    .string()
    .min(1, '訪問内容を入力してください。')
    .max(1000, '訪問内容は1000文字以内で入力してください。'),
});

/**
 * 訪問記録配列のバリデーションスキーマ（日報フォーム用）
 */
export const visitsArraySchema = z.array(visitFormSchema);

/**
 * 訪問記録配列のバリデーションスキーマ（提出時用：1件以上必須）
 */
export const visitsRequiredArraySchema = z
  .array(visitFormSchema)
  .min(1, '日報を提出するには、訪問記録を1件以上登録してください。');

/**
 * 型定義
 */
export type VisitFormInput = z.infer<typeof visitFormSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
