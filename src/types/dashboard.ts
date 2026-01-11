/**
 * Dashboard types
 *
 * Based on doc/screen-specification.md (S-002 Dashboard)
 * and doc/api-specification.md (Dashboard statistics)
 */

/**
 * Dashboard statistics for the current month
 */
export interface DashboardStats {
  /** Number of submitted daily reports this month */
  submittedCount: number;
  /** Number of approved daily reports this month */
  approvedCount: number;
  /** Number of visits this month */
  visitCount: number;
  /** Number of reports pending approval (manager only) */
  pendingApprovalCount?: number;
}

/**
 * Today's daily report status
 */
export interface TodayReport {
  /** Report ID (null if not created yet) */
  reportId: number | null;
  /** Report date */
  reportDate: string;
  /** Status: "下書き" | "提出済み" | "承認済み" | "差し戻し" | null */
  status: '下書き' | '提出済み' | '承認済み' | '差し戻し' | null;
  /** Number of visits */
  visitCount: number;
}

/**
 * Recent daily report item for dashboard list
 */
export interface RecentReport {
  /** Report ID */
  reportId: number;
  /** Sales ID */
  salesId: number;
  /** Sales name (for manager view) */
  salesName?: string;
  /** Report date (YYYY/MM/DD format) */
  reportDate: string;
  /** Status */
  status: '下書き' | '提出済み' | '承認済み' | '差し戻し';
  /** Number of visits */
  visitCount: number;
  /** Brief summary/preview */
  summary?: string;
  /** Submitted timestamp */
  submittedAt?: string;
  /** Approved timestamp */
  approvedAt?: string;
}

/**
 * Pending approval report item (manager only)
 */
export interface PendingReport {
  /** Report ID */
  reportId: number;
  /** Sales ID */
  salesId: number;
  /** Sales name */
  salesName: string;
  /** Report date (YYYY/MM/DD format) */
  reportDate: string;
  /** Submitted timestamp */
  submittedAt: string;
  /** Number of visits */
  visitCount: number;
}

/**
 * Complete dashboard data
 */
export interface DashboardData {
  /** User information */
  user: {
    salesId: number;
    salesName: string;
    role: '一般' | '上長';
  };
  /** Statistics for the current month */
  stats: DashboardStats;
  /** Today's report information */
  todayReport: TodayReport;
  /** Recent reports (up to 5) */
  recentReports: RecentReport[];
  /** Pending approval reports (manager only) */
  pendingReports?: PendingReport[];
}
