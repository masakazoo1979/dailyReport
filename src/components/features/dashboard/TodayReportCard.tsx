import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Edit, FileText, Plus } from 'lucide-react';
import { TodayReport } from '@/types/dashboard';

/**
 * Today's Report Card Component
 *
 * Displays the status of today's daily report
 * Shows different CTAs based on report status:
 * - No report: "Create Report" button
 * - Draft: "Edit Report" button
 * - Submitted/Approved: Status badge with view link
 */

export interface TodayReportCardProps {
  /** Today's report data */
  report: TodayReport;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Get badge variant and label based on status
 */
function getStatusBadge(status: TodayReport['status']) {
  if (!status) return null;

  const variants = {
    下書き: { variant: 'secondary' as const, label: '下書き' },
    提出済み: { variant: 'default' as const, label: '提出済み' },
    承認済み: { variant: 'default' as const, label: '承認済み' },
    差し戻し: { variant: 'destructive' as const, label: '差し戻し' },
  };

  return variants[status];
}

/**
 * TodayReportCard Component
 *
 * Shows today's daily report status with appropriate actions
 * Follows screen specification S-002 (Dashboard)
 */
export function TodayReportCard({ report, className }: TodayReportCardProps) {
  const statusBadge = getStatusBadge(report.status);
  const hasReport = report.reportId !== null;
  const canEdit =
    !report.status ||
    report.status === '下書き' ||
    report.status === '差し戻し';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          本日の日報
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">日付:</p>
            <p className="text-sm font-medium">{report.reportDate}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">ステータス:</p>
            {statusBadge ? (
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            ) : (
              <span className="text-sm text-muted-foreground">未作成</span>
            )}
          </div>

          {hasReport && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">訪問記録:</p>
              <p className="text-sm font-medium">{report.visitCount}件</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!hasReport ? (
            <Button asChild className="w-full" size="sm">
              <Link href="/reports/new">
                <Plus className="h-4 w-4" />
                日報を作成
              </Link>
            </Button>
          ) : canEdit ? (
            <>
              <Button asChild variant="outline" className="flex-1" size="sm">
                <Link href={`/reports/${report.reportId}`}>
                  <FileText className="h-4 w-4" />
                  詳細
                </Link>
              </Button>
              <Button asChild className="flex-1" size="sm">
                <Link href={`/reports/${report.reportId}/edit`}>
                  <Edit className="h-4 w-4" />
                  編集
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link href={`/reports/${report.reportId}`}>
                <FileText className="h-4 w-4" />
                詳細を見る
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
