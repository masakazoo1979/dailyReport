import { DashboardData } from '@/types/dashboard';

/**
 * Mock Dashboard Data
 *
 * Temporary mock data for dashboard development
 * In production, this should be replaced with actual API calls or Server Actions
 *
 * TODO: Replace with real data fetching from database
 */

/**
 * Get mock dashboard data for a regular sales user
 */
export function getMockDashboardDataForSales(): DashboardData {
  return {
    user: {
      salesId: 1,
      salesName: '山田太郎',
      role: '一般',
    },
    stats: {
      submittedCount: 15,
      approvedCount: 12,
      visitCount: 42,
    },
    todayReport: {
      reportId: 100,
      reportDate: new Date().toISOString().split('T')[0],
      status: '下書き',
      visitCount: 2,
    },
    recentReports: [
      {
        reportId: 99,
        salesId: 1,
        reportDate: '2024-01-10',
        status: '承認済み',
        visitCount: 3,
        summary: '新規提案1件、既存フォロー2件',
        submittedAt: '2024-01-10T18:30:00Z',
        approvedAt: '2024-01-11T09:00:00Z',
      },
      {
        reportId: 98,
        salesId: 1,
        reportDate: '2024-01-09',
        status: '承認済み',
        visitCount: 2,
        summary: '商談フォローアップ',
        submittedAt: '2024-01-09T18:00:00Z',
        approvedAt: '2024-01-10T09:30:00Z',
      },
      {
        reportId: 97,
        salesId: 1,
        reportDate: '2024-01-08',
        status: '承認済み',
        visitCount: 4,
        summary: '新規開拓訪問4件',
        submittedAt: '2024-01-08T19:00:00Z',
        approvedAt: '2024-01-09T10:00:00Z',
      },
      {
        reportId: 96,
        salesId: 1,
        reportDate: '2024-01-05',
        status: '承認済み',
        visitCount: 3,
        summary: '既存顧客定期訪問',
        submittedAt: '2024-01-05T17:45:00Z',
        approvedAt: '2024-01-08T09:15:00Z',
      },
      {
        reportId: 95,
        salesId: 1,
        reportDate: '2024-01-04',
        status: '承認済み',
        visitCount: 2,
        summary: '商談クロージング',
        submittedAt: '2024-01-04T18:20:00Z',
        approvedAt: '2024-01-05T09:45:00Z',
      },
    ],
  };
}

/**
 * Get mock dashboard data for a manager user
 */
export function getMockDashboardDataForManager(): DashboardData {
  return {
    user: {
      salesId: 5,
      salesName: '佐藤花子',
      role: '上長',
    },
    stats: {
      submittedCount: 8,
      approvedCount: 6,
      visitCount: 24,
      pendingApprovalCount: 3,
    },
    todayReport: {
      reportId: 200,
      reportDate: new Date().toISOString().split('T')[0],
      status: '承認済み',
      visitCount: 3,
    },
    recentReports: [
      {
        reportId: 199,
        salesId: 5,
        salesName: '佐藤花子',
        reportDate: '2024-01-10',
        status: '承認済み',
        visitCount: 2,
        summary: 'チーム会議、顧客訪問2件',
        submittedAt: '2024-01-10T19:00:00Z',
        approvedAt: '2024-01-11T08:30:00Z',
      },
      {
        reportId: 198,
        salesId: 5,
        salesName: '佐藤花子',
        reportDate: '2024-01-09',
        status: '承認済み',
        visitCount: 3,
        summary: '重要顧客訪問',
        submittedAt: '2024-01-09T18:30:00Z',
        approvedAt: '2024-01-10T09:00:00Z',
      },
      {
        reportId: 197,
        salesId: 1,
        salesName: '山田太郎',
        reportDate: '2024-01-10',
        status: '承認済み',
        visitCount: 3,
        summary: '新規提案1件、既存フォロー2件',
        submittedAt: '2024-01-10T18:30:00Z',
        approvedAt: '2024-01-11T09:00:00Z',
      },
      {
        reportId: 196,
        salesId: 2,
        salesName: '鈴木一郎',
        reportDate: '2024-01-10',
        status: '提出済み',
        visitCount: 4,
        summary: '新規開拓活動',
        submittedAt: '2024-01-10T18:00:00Z',
      },
      {
        reportId: 195,
        salesId: 3,
        salesName: '田中美咲',
        reportDate: '2024-01-10',
        status: '提出済み',
        visitCount: 2,
        summary: '既存顧客フォロー',
        submittedAt: '2024-01-10T17:30:00Z',
      },
    ],
    pendingReports: [
      {
        reportId: 196,
        salesId: 2,
        salesName: '鈴木一郎',
        reportDate: '2024-01-10',
        submittedAt: '2024-01-10T18:00:00Z',
        visitCount: 4,
      },
      {
        reportId: 195,
        salesId: 3,
        salesName: '田中美咲',
        reportDate: '2024-01-10',
        submittedAt: '2024-01-10T17:30:00Z',
        visitCount: 2,
      },
      {
        reportId: 194,
        salesId: 1,
        salesName: '山田太郎',
        reportDate: '2024-01-09',
        submittedAt: '2024-01-09T19:15:00Z',
        visitCount: 3,
      },
    ],
  };
}

/**
 * Get mock dashboard data based on user role
 *
 * @param role User role ('一般' or '上長')
 * @returns Mock dashboard data
 */
export function getMockDashboardData(
  role: '一般' | '上長' = '一般'
): DashboardData {
  return role === '上長'
    ? getMockDashboardDataForManager()
    : getMockDashboardDataForSales();
}
