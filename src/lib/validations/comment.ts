import { z } from 'zod';

/**
 * コメント内容のバリデーションスキーマ
 */
export const commentContentSchema = z
  .string()
  .min(1, 'コメントを入力してください。')
  .max(1000, 'コメントは1000文字以内で入力してください。');

/**
 * コメントフォームのバリデーションスキーマ
 */
export const commentFormSchema = z.object({
  commentContent: commentContentSchema,
});

/**
 * コメント投稿APIリクエストのバリデーションスキーマ
 */
export const createCommentSchema = z.object({
  commentContent: commentContentSchema,
});

/**
 * 差し戻し時のコメント投稿スキーマ（任意）
 */
export const rejectCommentSchema = z.object({
  comment: z
    .string()
    .max(1000, 'コメントは1000文字以内で入力してください。')
    .optional()
    .nullable()
    .or(z.literal('')),
});

/**
 * 型定義
 */
export type CommentFormInput = z.infer<typeof commentFormSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type RejectCommentInput = z.infer<typeof rejectCommentSchema>;
