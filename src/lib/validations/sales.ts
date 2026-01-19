import { z } from 'zod';
import { ROLES } from '@/lib/constants';

/**
 * 営業担当者フォームのバリデーションスキーマ
 */
export const salesFormSchema = z
  .object({
    salesName: z
      .string()
      .min(1, '営業担当者名を入力してください。')
      .max(100, '営業担当者名は100文字以内で入力してください。'),
    email: z
      .string()
      .min(1, 'メールアドレスを入力してください。')
      .email('メールアドレスの形式が正しくありません。')
      .max(255, 'メールアドレスは255文字以内で入力してください。'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください。')
      .max(255, 'パスワードは255文字以内で入力してください。')
      .optional()
      .or(z.literal('')),
    department: z
      .string()
      .min(1, '所属部署を入力してください。')
      .max(100, '所属部署は100文字以内で入力してください。'),
    role: z.enum([ROLES.MANAGER, ROLES.SALES], {
      errorMap: () => ({ message: '役割を選択してください。' }),
    }),
    managerId: z.number().int().positive().optional().nullable(),
  })
  .refine(
    () => {
      // 新規作成時（passwordが必須）の場合のみチェック
      // 編集時はpasswordは省略可能なので、呼び出し側で制御
      return true;
    },
    {
      message: 'パスワードを入力してください。',
      path: ['password'],
    }
  );

/**
 * 営業担当者作成APIリクエストのバリデーションスキーマ
 */
export const createSalesSchema = z.object({
  salesName: z
    .string()
    .min(1, '営業担当者名を入力してください。')
    .max(100, '営業担当者名は100文字以内で入力してください。'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('メールアドレスの形式が正しくありません。')
    .max(255, 'メールアドレスは255文字以内で入力してください。'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください。')
    .max(255, 'パスワードは255文字以内で入力してください。'),
  department: z
    .string()
    .min(1, '所属部署を入力してください。')
    .max(100, '所属部署は100文字以内で入力してください。'),
  role: z.enum([ROLES.MANAGER, ROLES.SALES], {
    errorMap: () => ({ message: '役割を選択してください。' }),
  }),
  managerId: z.number().int().positive().optional().nullable(),
});

/**
 * 営業担当者更新APIリクエストのバリデーションスキーマ
 * パスワードは任意
 */
export const updateSalesSchema = z.object({
  salesName: z
    .string()
    .min(1, '営業担当者名を入力してください。')
    .max(100, '営業担当者名は100文字以内で入力してください。'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('メールアドレスの形式が正しくありません。')
    .max(255, 'メールアドレスは255文字以内で入力してください。'),
  department: z
    .string()
    .min(1, '所属部署を入力してください。')
    .max(100, '所属部署は100文字以内で入力してください。'),
  role: z.enum([ROLES.MANAGER, ROLES.SALES], {
    errorMap: () => ({ message: '役割を選択してください。' }),
  }),
  managerId: z.number().int().positive().optional().nullable(),
});

/**
 * 型定義
 */
export type SalesFormInput = z.infer<typeof salesFormSchema>;
export type CreateSalesInput = z.infer<typeof createSalesSchema>;
export type UpdateSalesInput = z.infer<typeof updateSalesSchema>;
