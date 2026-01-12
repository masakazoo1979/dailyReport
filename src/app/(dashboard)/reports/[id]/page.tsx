import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { fetchReportDetail } from './actions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Edit } from 'lucide-react';
import { ReportDetailView } from '@/components/features/reports/ReportDetailView';
import { CommentSection } from '@/components/features/reports/CommentSection';
import { ApprovalButtons } from '@/components/features/reports/ApprovalButtons';

export const metadata: Metadata = {
  title: '日報詳細 | 営業日報システム',
  description: '日報の詳細情報を表示します',
};

interface ReportDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Daily Report Detail Screen (S-005)
 *
 * Based on doc/screen-specification.md S-005 日報詳細/承認画面
 *
 * Features:
 * - Display daily report details (sales person, date, status, etc.)
 * - Display visit records
 * - Display issues/consultations and tomorrow's plan
 * - Display comments list
 * - Comment posting form
 * - Edit button (for owner & editable status)
 * - Approval button (manager only, for submitted reports)
 * - Reject button (manager only, for submitted reports)
 *
 * Screen Elements:
 * - RD-001 to RD-009: Report information (read-only)
 * - RD-010: Comments list
 * - RD-011: Comment input
 * - RD-012: Comment post button
 * - RD-013: Approval button (manager only)
 * - RD-014: Reject button (manager only)
 * - RD-015: Back button
 *
 * Permissions:
 * - Owner: Can view own reports
 * - Manager: Can view subordinate reports
 * - Owner can edit if status is '下書き' or '差し戻し'
 * - Manager can approve/reject if status is '提出済み'
 */
export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const reportId = parseInt(params.id, 10);
  if (isNaN(reportId)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">日報詳細</h1>
            <p className="text-muted-foreground">日報の詳細情報</p>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <Suspense fallback={<ReportDetailSkeleton />}>
        <ReportDetailContent reportId={reportId} currentUser={session.user} />
      </Suspense>
    </div>
  );
}

/**
 * Report Detail Content (Server Component)
 */
async function ReportDetailContent({
  reportId,
  currentUser,
}: {
  reportId: number;
  currentUser: {
    salesId: number;
    role: '一般' | '上長';
  };
}) {
  let report;
  try {
    report = await fetchReportDetail(reportId);
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error && error.message
            ? error.message
            : '日報の取得に失敗しました'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    notFound();
  }

  // Check permissions
  const isOwner = report.salesId === currentUser.salesId;
  const isManager = currentUser.role === '上長';

  // Check if user can edit (owner and status is editable)
  const canEdit =
    isOwner && (report.status === '下書き' || report.status === '差し戻し');

  // Check if manager is the owner's manager
  // Since fetchReportDetail already validates access, if we're here as a manager,
  // we must be the owner's manager
  const isManagerOfOwner = isManager && !isOwner;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Content (Left Column - 2/3) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Report Details */}
        <ReportDetailView report={report} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Edit Button - Show for owner if status is editable */}
          {canEdit && (
            <Button asChild>
              <Link href={`/dashboard/reports/${reportId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                編集
              </Link>
            </Button>
          )}

          {/* Approval Buttons - Show for manager if status is submitted */}
          <ApprovalButtons
            reportId={reportId}
            status={report.status}
            userRole={currentUser.role}
            isManagerOfOwner={isManagerOfOwner}
          />

          {/* Back Button */}
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">戻る</Link>
          </Button>
        </div>
      </div>

      {/* Comments Section (Right Column - 1/3) */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <CommentSection
              reportId={reportId}
              comments={report.comments || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for report detail
 */
function ReportDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Info Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Visit Records Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>

        {/* Buttons Skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Comments Skeleton */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
