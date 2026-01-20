import { z } from 'zod';

/**
 * 共通バリデーションスキーマ・関数
 */

/**
 * メールアドレスのバリデーションスキーマ
 */
export const emailSchema = z
  .string()
  .min(1, 'メールアドレスを入力してください。')
  .email('メールアドレスの形式が正しくありません。')
  .max(255, 'メールアドレスは255文字以内で入力してください。');

/**
 * パスワードのバリデーションスキーマ（新規作成時用）
 */
export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください。')
  .max(255, 'パスワードは255文字以内で入力してください。');

/**
 * 電話番号の正規表現（数字とハイフンのみ）
 */
export const phoneRegex = /^[0-9-]*$/;

/**
 * 電話番号のバリデーションスキーマ
 */
export const phoneSchema = z
  .string()
  .max(20, '電話番号は20文字以内で入力してください。')
  .regex(phoneRegex, '電話番号の形式が正しくありません。')
  .optional()
  .nullable()
  .or(z.literal(''));

/**
 * 時刻の正規表現（HH:MM形式）
 */
export const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

/**
 * 時刻のバリデーションスキーマ
 */
export const timeSchema = z
  .string()
  .min(1, '時刻を入力してください。')
  .regex(timeRegex, '時刻はHH:MM形式で入力してください。（例: 14:30）');

/**
 * 日付の正規表現（YYYY-MM-DD形式）
 */
export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 日付文字列のバリデーションスキーマ（API用）
 */
export const dateStringSchema = z
  .string()
  .min(1, '日付を入力してください。')
  .regex(dateRegex, '日付はYYYY-MM-DD形式で入力してください。');

/**
 * IDのバリデーションスキーマ（正の整数）
 */
export const idSchema = z.number().int().positive();

/**
 * オプショナルIDのバリデーションスキーマ
 */
export const optionalIdSchema = z
  .number()
  .int()
  .positive()
  .optional()
  .nullable();

/**
 * ページネーションのバリデーションスキーマ
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

/**
 * ソートのバリデーションスキーマ
 */
export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 検索期間のバリデーションスキーマ
 */
export const dateRangeSchema = z
  .object({
    startDate: dateStringSchema.optional().nullable(),
    endDate: dateStringSchema.optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: '終了日は開始日以降の日付を指定してください。',
      path: ['endDate'],
    }
  );

/**
 * テキストフィールドのバリデーションスキーマを生成
 */
export const createTextSchema = (
  fieldName: string,
  maxLength: number,
  required: boolean = false
) => {
  const baseSchema = z
    .string()
    .max(maxLength, `${fieldName}は${maxLength}文字以内で入力してください。`);

  if (required) {
    return baseSchema.min(1, `${fieldName}を入力してください。`);
  }

  return baseSchema.optional().nullable().or(z.literal(''));
};

/**
 * Zodエラーメッセージを日本語に変換するカスタムエラーマップ
 */
export const japaneseErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') {
        return { message: '必須項目です。' };
      }
      return { message: `無効な値です。` };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        if (issue.minimum === 1) {
          return { message: '入力してください。' };
        }
        return { message: `${issue.minimum}文字以上で入力してください。` };
      }
      if (issue.type === 'number') {
        return { message: `${issue.minimum}以上の値を入力してください。` };
      }
      if (issue.type === 'array') {
        return { message: `${issue.minimum}件以上登録してください。` };
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `${issue.maximum}文字以内で入力してください。` };
      }
      if (issue.type === 'number') {
        return { message: `${issue.maximum}以下の値を入力してください。` };
      }
      if (issue.type === 'array') {
        return { message: `${issue.maximum}件以下にしてください。` };
      }
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'メールアドレスの形式が正しくありません。' };
      }
      if (issue.validation === 'regex') {
        return { message: '形式が正しくありません。' };
      }
      break;
    case z.ZodIssueCode.invalid_enum_value:
      return { message: '有効な値を選択してください。' };
    default:
      break;
  }
  return { message: ctx.defaultError };
};

/**
 * 型定義
 */
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SortInput = z.infer<typeof sortSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
