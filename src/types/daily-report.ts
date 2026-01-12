/**
 * 日報関連の型定義
 */

/**
 * 日報ステータス
 */
export type DailyReportStatus = '下書き' | '提出済み' | '承認済み' | '差し戻し';

/**
 * 訪問記録（フォーム用）
 */
export interface VisitRecordFormData {
  visitId?: number;
  visitTime: string;
  customerId: number;
  visitContent: string;
}

/**
 * 日報フォームデータ
 */
export interface DailyReportFormData {
  reportDate: string;
  problem: string;
  plan: string;
  visits: VisitRecordFormData[];
}

/**
 * 訪問記録（API レスポンス）
 */
export interface VisitRecord {
  visitId: number;
  reportId: number;
  customerId: number;
  customerName: string;
  companyName: string;
  visitTime: string;
  visitContent: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * コメント（API レスポンス）
 */
export interface Comment {
  commentId: number;
  reportId: number;
  salesId: number;
  salesName: string;
  commentContent: string;
  createdAt: string;
}

/**
 * 日報詳細（API レスポンス）
 */
export interface DailyReport {
  reportId: number;
  salesId: number;
  salesName: string;
  department?: string;
  reportDate: string;
  problem: string | null;
  plan: string | null;
  status: DailyReportStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: number | null;
  approvedByName: string | null;
  visits: VisitRecord[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 日報一覧項目（API レスポンス）
 */
export interface DailyReportListItem {
  reportId: number;
  salesId: number;
  salesName: string;
  reportDate: string;
  status: DailyReportStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: number | null;
  visitCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 顧客選択用データ
 */
export interface CustomerOption {
  customerId: number;
  customerName: string;
  companyName: string;
}
