import { z } from 'zod';
import { INDUSTRIES } from '@/lib/constants';

/**
 * 電話番号のバリデーション（数字とハイフンのみ）
 */
const phoneRegex = /^[0-9-]*$/;

/**
 * 顧客フォームのバリデーションスキーマ
 */
export const customerFormSchema = z.object({
  companyName: z
    .string()
    .min(1, '会社名を入力してください。')
    .max(255, '会社名は255文字以内で入力してください。'),
  customerName: z
    .string()
    .min(1, '顧客担当者名を入力してください。')
    .max(100, '顧客担当者名は100文字以内で入力してください。'),
  industry: z
    .enum(
      [
        INDUSTRIES.IT,
        INDUSTRIES.MANUFACTURING,
        INDUSTRIES.FINANCE,
        INDUSTRIES.RETAIL,
        INDUSTRIES.SERVICE,
        INDUSTRIES.OTHER,
      ],
      {
        errorMap: () => ({ message: '業種を選択してください。' }),
      }
    )
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(20, '電話番号は20文字以内で入力してください。')
    .regex(phoneRegex, '電話番号の形式が正しくありません。')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z
    .string()
    .email('メールアドレスの形式が正しくありません。')
    .max(255, 'メールアドレスは255文字以内で入力してください。')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, '住所は500文字以内で入力してください。')
    .optional()
    .nullable()
    .or(z.literal('')),
});

/**
 * 顧客作成APIリクエストのバリデーションスキーマ
 */
export const createCustomerSchema = z.object({
  companyName: z
    .string()
    .min(1, '会社名を入力してください。')
    .max(255, '会社名は255文字以内で入力してください。'),
  customerName: z
    .string()
    .min(1, '顧客担当者名を入力してください。')
    .max(100, '顧客担当者名は100文字以内で入力してください。'),
  industry: z
    .enum([
      INDUSTRIES.IT,
      INDUSTRIES.MANUFACTURING,
      INDUSTRIES.FINANCE,
      INDUSTRIES.RETAIL,
      INDUSTRIES.SERVICE,
      INDUSTRIES.OTHER,
    ])
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(20, '電話番号は20文字以内で入力してください。')
    .regex(phoneRegex, '電話番号の形式が正しくありません。')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('メールアドレスの形式が正しくありません。')
    .max(255, 'メールアドレスは255文字以内で入力してください。')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, '住所は500文字以内で入力してください。')
    .optional()
    .nullable(),
});

/**
 * 顧客更新APIリクエストのバリデーションスキーマ
 */
export const updateCustomerSchema = createCustomerSchema;

/**
 * 型定義
 */
export type CustomerFormInput = z.infer<typeof customerFormSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
