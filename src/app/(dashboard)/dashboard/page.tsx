import { FileCheck, FileText, MapPin, ClipboardList } from 'lucide-react';
import {
  StatsCard,
  TodayReportCard,
  RecentReportsList,
  PendingApprovalList,
} from '@/components/features/dashboard';
import { getMockDashboardData } from '@/lib/mock-dashboard-data';

/**
 * Dashboard Page (S-002)
 *
 * Main dashboard page showing:
 * - Welcome message with user name
 * - Today's report status and quick actions
 * - Monthly statistics (submitted, approved, visits)
 * - Pending approval reports (manager only)
 * - Recent reports list (last 5)
 *
 * Based on doc/screen-specification.md S-002 Dashboard
 *
 * Features:
 * - Role-based content display (一般 vs 上長)
 * - Responsive grid layout
 * - Quick access to create/edit daily reports
 * - Statistics cards with icons
 * - Recent reports with status badges
 *
 * TODO: Replace mock data with actual Server Actions/API calls
 * TODO: Get user role from authentication session
 */
export default function DashboardPage() {
  // TODO: Get user from session/auth
  // For now, using mock data
  // Change role to '上長' to test manager view
  const mockRole: '一般' | '上長' = '一般';
  const dashboardData = getMockDashboardData(mockRole);

  const { user, stats, todayReport, recentReports, pendingReports } =
    dashboardData;
  const isManager = user.role === '上長';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">
          ようこそ、{user.salesName}さん
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Report Card - Full width on mobile, spans 2 columns on md+ */}
        <div className="md:col-span-2 lg:col-span-1">
          <TodayReportCard report={todayReport} />
        </div>

        {/* Monthly Statistics */}
        <StatsCard
          title="今月の提出"
          value={stats.submittedCount}
          description="件の日報を提出"
          icon={FileText}
          iconColor="text-blue-500"
          variant="primary"
        />

        <StatsCard
          title="今月の承認"
          value={stats.approvedCount}
          description="件の日報が承認済み"
          icon={FileCheck}
          iconColor="text-green-500"
          variant="success"
        />

        <StatsCard
          title="今月の訪問"
          value={stats.visitCount}
          description="件の訪問を記録"
          icon={MapPin}
          iconColor="text-purple-500"
        />
      </div>

      {/* Manager-only: Pending Approval Reports */}
      {isManager && stats.pendingApprovalCount !== undefined && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pending Approval Count Card */}
          <StatsCard
            title="承認待ち"
            value={stats.pendingApprovalCount}
            description="件の日報が承認待ちです"
            icon={ClipboardList}
            iconColor="text-orange-500"
            variant="warning"
          />

          {/* Pending Reports List */}
          <div className="md:col-span-2">
            {pendingReports && <PendingApprovalList reports={pendingReports} />}
          </div>
        </div>
      )}

      {/* Recent Reports List */}
      <RecentReportsList reports={recentReports} showSalesName={isManager} />

      {/* Development Note - Remove in production */}
      <div className="border-t pt-4">
        <p className="text-xs text-muted-foreground text-center">
          開発中: 現在はモックデータを表示しています。
          {isManager ? '上長ビューで表示中' : '一般営業ビューで表示中'}
        </p>
      </div>
    </div>
  );
}
