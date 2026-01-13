import { z } from 'zod';

/**
 * 業種定義
 *
 * Based on doc/screen-specification.md S-007 顧客マスタ登録/編集画面
 * CE-003: IT/製造/金融/小売/サービス/その他
 */
export const INDUSTRIES = [
  'IT',
  '製造',
  '金融',
  '小売',
  'サービス',
  'その他',
] as const;
export type Industry = (typeof INDUSTRIES)[number];

/**
 * 顧客検索条件スキーマ
 *
 * Based on doc/screen-specification.md S-006 顧客マスタ一覧画面
 *
 * 画面項目:
 * - C-001: 会社名（検索） - テキスト、部分一致検索
 * - C-002: 業種（検索） - セレクトボックス、初期値: すべて
 *
 * Based on doc/api-specification.md GET /customers
 */
export const customersFilterSchema = z.object({
  // C-001: 会社名（検索）
  company_name: z.string().max(255).optional(),

  // C-002: 業種（検索）
  industry: z.enum([...INDUSTRIES, 'すべて'] as const).optional(),

  // ページング
  page: z.coerce.number().positive().default(1),
  per_page: z.coerce.number().positive().max(100).default(20),

  // ソート
  sort: z
    .enum(['company_name', 'customer_name', 'industry', 'created_at'])
    .default('company_name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type CustomersFilter = z.infer<typeof customersFilterSchema>;

/**
 * 顧客一覧データスキーマ (API レスポンス)
 *
 * Based on doc/api-specification.md GET /customers
 *
 * Response fields:
 * - customer_id: number
 * - customer_name: string (100文字以内)
 * - company_name: string (255文字以内)
 * - industry: string (IT/製造/金融/小売/サービス/その他)
 * - phone: string (20文字以内、電話番号形式)
 * - email: string (255文字以内、メールアドレス形式)
 * - address: string (500文字以内)
 * - created_at: string (ISO 8601形式)
 * - updated_at: string (ISO 8601形式)
 */
export const customerListItemSchema = z.object({
  customer_id: z.number(),
  customer_name: z.string(),
  company_name: z.string(),
  industry: z.enum(INDUSTRIES).nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CustomerListItem = z.infer<typeof customerListItemSchema>;

/**
 * ページネーション情報スキーマ
 */
export const paginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
});

export type PaginationInfo = z.infer<typeof paginationSchema>;

/**
 * 顧客一覧レスポンススキーマ
 */
export const customersListResponseSchema = z.object({
  data: z.array(customerListItemSchema),
  pagination: paginationSchema,
});

export type CustomersListResponse = z.infer<typeof customersListResponseSchema>;

/**
 * 顧客登録/編集スキーマ
 *
 * Based on doc/screen-specification.md S-007 顧客マスタ登録/編集画面
 * Based on doc/api-specification.md POST /customers
 *
 * バリデーション:
 * - E-019: 会社名を入力してください
 * - E-020: 会社名は255文字以内で入力してください
 * - E-021: 顧客担当者名を入力してください
 * - E-022: 顧客担当者名は100文字以内で入力してください
 * - E-023: 電話番号の形式が正しくありません
 * - E-002: メールアドレスの形式が正しくありません
 * - E-024: メールアドレスは255文字以内で入力してください
 * - E-025: 住所は500文字以内で入力してください
 */
export const customerFormSchema = z.object({
  // CE-001: 会社名 (必須、255文字以内)
  company_name: z
    .string()
    .min(1, '会社名を入力してください') // E-019
    .max(255, '会社名は255文字以内で入力してください'), // E-020

  // CE-002: 顧客担当者名 (必須、100文字以内)
  customer_name: z
    .string()
    .min(1, '顧客担当者名を入力してください') // E-021
    .max(100, '顧客担当者名は100文字以内で入力してください'), // E-022

  // CE-003: 業種 (任意)
  industry: z.enum(INDUSTRIES).nullable().optional(),

  // CE-004: 電話番号 (任意、20文字以内、電話番号形式)
  phone: z
    .string()
    .max(20)
    .regex(/^[\d-+()]*$/, '電話番号の形式が正しくありません') // E-023
    .nullable()
    .optional()
    .or(z.literal('')),

  // CE-005: メールアドレス (任意、255文字以内、メールアドレス形式)
  email: z
    .string()
    .email('メールアドレスの形式が正しくありません') // E-002
    .max(255, 'メールアドレスは255文字以内で入力してください') // E-024
    .nullable()
    .optional()
    .or(z.literal('')),

  // CE-006: 住所 (任意、500文字以内)
  address: z
    .string()
    .max(500, '住所は500文字以内で入力してください') // E-025
    .nullable()
    .optional()
    .or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

/**
 * 業種のラベル取得
 */
export const getIndustryLabel = (industry: Industry | null): string => {
  return industry || '-';
};
