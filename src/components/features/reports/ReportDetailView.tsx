import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Building2, Clock, MapPin } from 'lucide-react';
import type { DailyReport, DailyReportStatus } from '@/types/daily-report';

interface ReportDetailViewProps {
  report: DailyReport;
}

/**
 * ReportDetailView Component
 *
 * Based on doc/screen-specification.md S-005 日報詳細/承認画面
 * - RD-001: 営業担当者（表示のみ）
 * - RD-002: 報告日（表示のみ）
 * - RD-003: ステータス（表示のみ）
 * - RD-004: 提出日時（表示のみ）
 * - RD-005: 承認日時（表示のみ）
 * - RD-006: 承認者（表示のみ）
 * - RD-007: 訪問記録一覧（表示のみ）
 * - RD-008: 課題・相談（表示のみ）
 * - RD-009: 明日の予定（表示のみ）
 *
 * Features:
 * - Display report basic information
 * - Display visit records in a table
 * - Display issues and plans
 * - Display approval information
 */
export function ReportDetailView({ report }: ReportDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>日報情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Sales Person */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">営業担当者</p>
                <p className="font-medium">
                  {report.salesName}
                  {report.department && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({report.department})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Report Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">報告日</p>
                <p className="font-medium">{formatDate(report.reportDate)}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4" /> {/* Spacer */}
              <div>
                <p className="text-sm text-muted-foreground">ステータス</p>
                <StatusBadge status={report.status} />
              </div>
            </div>

            {/* Submitted At */}
            {report.submittedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">提出日時</p>
                  <p className="font-medium">
                    {formatDateTime(report.submittedAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Approved At */}
            {report.approvedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">承認日時</p>
                  <p className="font-medium">
                    {formatDateTime(report.approvedAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Approver */}
            {report.approvedByName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">承認者</p>
                  <p className="font-medium">{report.approvedByName}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visit Records */}
      <Card>
        <CardHeader>
          <CardTitle>訪問記録</CardTitle>
        </CardHeader>
        <CardContent>
          {report.visits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              訪問記録はありません
            </p>
          ) : (
            <div className="space-y-4">
              {report.visits.map((visit, index) => (
                <div key={visit.visitId}>
                  <div className="space-y-3">
                    {/* Visit Header */}
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{visit.visitTime}</span>
                      </div>
                      <div className="flex items-start gap-2 flex-1">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{visit.companyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {visit.customerName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Visit Content */}
                    <div className="ml-[116px] pl-6 border-l-2">
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {visit.visitContent}
                      </p>
                    </div>
                  </div>

                  {index < report.visits.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues and Consultation */}
      {report.problem && (
        <Card>
          <CardHeader>
            <CardTitle>課題・相談</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap break-words">
              {report.problem}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tomorrow's Plan */}
      {report.plan && (
        <Card>
          <CardHeader>
            <CardTitle>明日の予定</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap break-words">
              {report.plan}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: DailyReportStatus }) {
  const config = getStatusConfig(status);

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Get status badge configuration
 */
function getStatusConfig(status: DailyReportStatus): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case '下書き':
      return { label: '下書き', variant: 'outline' };
    case '提出済み':
      return { label: '提出済み', variant: 'default' };
    case '承認済み':
      return { label: '承認済み', variant: 'secondary' };
    case '差し戻し':
      return { label: '差し戻し', variant: 'destructive' };
    default:
      return { label: status, variant: 'outline' };
  }
}

/**
 * Format date string (YYYY-MM-DD -> YYYY/MM/DD)
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format ISO datetime string to Japanese format
 */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}
