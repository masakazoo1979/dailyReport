import { z } from 'zod';

/**
 * 日報ステータス定義
 */
export const REPORT_STATUSES = [
  '下書き',
  '提出済み',
  '承認済み',
  '差し戻し',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/**
 * 日報一覧検索条件スキーマ
 *
 * Based on doc/screen-specification.md S-003 日報一覧画面
 *
 * 画面項目:
 * - R-001: 期間(開始) - 日付、初期値: 当月初日
 * - R-002: 期間(終了) - 日付、初期値: 当月末日
 * - R-003: 営業担当者 - セレクトボックス、上長のみ表示
 * - R-004: ステータス - セレクトボックス、初期値: すべて
 *
 * バリデーション:
 * - E-005: 日付形式チェック
 * - E-006: 期間整合性チェック（開始≦終了）
 */
export const reportsFilterSchema = z
  .object({
    // R-001: 期間(開始)
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません')
      .optional(),

    // R-002: 期間(終了)
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません')
      .optional(),

    // R-003: 営業担当者 (上長のみ)
    salesId: z.coerce.number().positive().optional(),

    // R-004: ステータス
    status: z.enum([...REPORT_STATUSES, 'すべて'] as const).optional(),

    // ページング
    page: z.coerce.number().positive().default(1),
    perPage: z.coerce.number().positive().max(100).default(20),

    // ソート
    sort: z
      .enum(['report_date', 'status', 'sales_name', 'submitted_at'])
      .default('report_date'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .refine(
    (data) => {
      // E-006: 期間整合性チェック（開始≦終了）
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

export type ReportsFilter = z.infer<typeof reportsFilterSchema>;

/**
 * 日報一覧データスキーマ (API レスポンス)
 *
 * Based on doc/api-specification.md GET /reports
 */
export const reportListItemSchema = z.object({
  report_id: z.number(),
  sales_id: z.number(),
  sales_name: z.string(),
  report_date: z.string(), // YYYY-MM-DD
  status: z.enum(REPORT_STATUSES),
  submitted_at: z.string().nullable(),
  approved_at: z.string().nullable(),
  approved_by: z.number().nullable(),
  visit_count: z.number(),
  comment_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ReportListItem = z.infer<typeof reportListItemSchema>;

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
 * 日報一覧レスポンススキーマ
 */
export const reportsListResponseSchema = z.object({
  data: z.array(reportListItemSchema),
  pagination: paginationSchema,
});

export type ReportsListResponse = z.infer<typeof reportsListResponseSchema>;

/**
 * 営業担当者選択肢スキーマ (フィルター用)
 */
export const salesOptionSchema = z.object({
  value: z.number(),
  label: z.string(),
});

export type SalesOption = z.infer<typeof salesOptionSchema>;

/**
 * ステータスバッジのバリアント定義
 */
export const getStatusBadgeVariant = (
  status: ReportStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case '下書き':
      return 'outline';
    case '提出済み':
      return 'secondary';
    case '承認済み':
      return 'default';
    case '差し戻し':
      return 'destructive';
    default:
      return 'outline';
  }
};

/**
 * デフォルトフィルター値を取得
 * 当月初日～当月末日
 */
export const getDefaultDateRange = (): {
  startDate: string;
  endDate: string;
} => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 当月初日
  const startDate = new Date(year, month, 1);
  // 当月末日
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};
