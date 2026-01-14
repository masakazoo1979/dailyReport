import { z } from 'zod';

/**
 * ログインリクエストのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません')
    .max(255, 'メールアドレスは255文字以内で入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

/**
 * パスワード作成時のバリデーションスキーマ
 */
export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .max(255, 'パスワードは255文字以内で入力してください');

/**
 * ユーザー登録リクエストのバリデーションスキーマ
 */
export const registerSchema = z.object({
  salesName: z
    .string()
    .min(1, '担当者名を入力してください')
    .max(100, '担当者名は100文字以内で入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません')
    .max(255, 'メールアドレスは255文字以内で入力してください'),
  password: passwordSchema,
  department: z
    .string()
    .min(1, '部署を入力してください')
    .max(100, '部署は100文字以内で入力してください'),
  role: z.enum(['一般', '上長'], {
    errorMap: () => ({
      message: '役割は「一般」または「上長」を選択してください',
    }),
  }),
  managerId: z.number().int().positive().optional().nullable(),
});

/**
 * パスワード変更リクエストのバリデーションスキーマ
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

/**
 * 型定義
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
