import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { PendingReport } from '@/types/dashboard';

/**
 * Pending Approval List Component
 *
 * Displays reports awaiting approval (manager only)
 * Shows sales name, date, and quick action button
 */

export interface PendingApprovalListProps {
  /** List of pending approval reports */
  reports: PendingReport[];
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Format date string from YYYY-MM-DD to YYYY/MM/DD
 */
function formatDate(dateString: string): string {
  return dateString.replace(/-/g, '/');
}

/**
 * Format datetime to relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}日前`;
  } else if (diffHours > 0) {
    return `${diffHours}時間前`;
  } else {
    return '1時間以内';
  }
}

/**
 * PendingReportItem Component
 *
 * Individual pending report item
 */
function PendingReportItem({ report }: { report: PendingReport }) {
  return (
    <Link
      href={`/reports/${report.reportId}`}
      className="block border-b last:border-b-0 pb-3 last:pb-0 hover:bg-accent/50 transition-colors rounded-md px-3 py-2 -mx-3"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm">
              {formatDate(report.reportDate)}
            </p>
            <span className="text-xs text-muted-foreground">
              {report.salesName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>訪問{report.visitCount}件</span>
            <span>•</span>
            <span>{formatRelativeTime(report.submittedAt)}に提出</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">提出済み</Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

/**
 * PendingApprovalList Component
 *
 * Displays pending approval reports for managers
 * Based on screen specification S-002 (Dashboard - Manager view)
 */
export function PendingApprovalList({
  reports,
  className,
}: PendingApprovalListProps) {
  const hasPendingReports = reports.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          {hasPendingReports ? (
            <>
              <AlertCircle className="h-5 w-5 text-orange-500" />
              承認待ち日報
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              承認待ち日報
            </>
          )}
        </CardTitle>
        {hasPendingReports && (
          <Badge variant="default">{reports.length}件</Badge>
        )}
      </CardHeader>
      <CardContent>
        {!hasPendingReports ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20 text-green-500" />
            <p className="text-sm">承認待ちの日報はありません</p>
            <p className="text-xs mt-1">すべての日報が承認されています</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <PendingReportItem key={report.reportId} report={report} />
            ))}
            {reports.length > 5 && (
              <Button
                asChild
                variant="outline"
                className="w-full mt-4"
                size="sm"
              >
                <Link href="/reports?status=提出済み">
                  すべて見る ({reports.length}件)
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
