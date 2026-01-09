import { z } from "zod";

/**
 * ログインスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードを入力してください")
    .min(8, "パスワードは8文字以上で入力してください"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * ログインレスポンススキーマ
 */
export const loginResponseSchema = z.object({
  sales_id: z.number(),
  sales_name: z.string(),
  email: z.string().email(),
  department: z.string(),
  role: z.enum(["一般", "上長"]),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

/**
 * セッションユーザースキーマ
 */
export const sessionUserSchema = z.object({
  sales_id: z.number(),
  sales_name: z.string(),
  email: z.string().email(),
  department: z.string(),
  role: z.enum(["一般", "上長"]),
  manager_id: z.number().nullable(),
  manager_name: z.string().nullable(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
