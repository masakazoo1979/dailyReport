import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight } from 'lucide-react';
import { RecentReport } from '@/types/dashboard';

/**
 * Recent Reports List Component
 *
 * Displays the most recent daily reports (up to 5)
 * Shows date, status, visit count, and links to details
 */

export interface RecentReportsListProps {
  /** List of recent reports */
  reports: RecentReport[];
  /** Whether to show sales name (manager view) */
  showSalesName?: boolean;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Get badge variant based on status
 */
function getStatusVariant(
  status: RecentReport['status']
): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case '下書き':
      return 'secondary';
    case '提出済み':
      return 'default';
    case '承認済み':
      return 'default';
    case '差し戻し':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Format date string from YYYY-MM-DD to YYYY/MM/DD
 */
function formatDate(dateString: string): string {
  return dateString.replace(/-/g, '/');
}

/**
 * RecentReportItem Component
 *
 * Individual report item in the list
 */
function RecentReportItem({
  report,
  showSalesName,
}: {
  report: RecentReport;
  showSalesName?: boolean;
}) {
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
            {showSalesName && report.salesName && (
              <span className="text-xs text-muted-foreground">
                ({report.salesName})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>訪問{report.visitCount}件</span>
            {report.summary && (
              <>
                <span>•</span>
                <span className="truncate">{report.summary}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(report.status)}>
            {report.status}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

/**
 * RecentReportsList Component
 *
 * Displays recent daily reports in a card
 * Based on screen specification S-002 (Dashboard)
 */
export function RecentReportsList({
  reports,
  showSalesName = false,
  className,
}: RecentReportsListProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          最近の日報
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/reports">
            すべて見る
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">日報がまだありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <RecentReportItem
                key={report.reportId}
                report={report}
                showSalesName={showSalesName}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
