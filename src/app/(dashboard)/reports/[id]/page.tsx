import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { REPORT_STATUSES, ROLES, type ReportStatus } from '@/lib/constants';
import { getAllowedSalesIds } from '@/lib/utils/cache';
import { CommentSection } from '@/components/features/reports/CommentSection';

// 動的インポート: 上長のみ使用するコンポーネントを遅延読み込み
const ReportDetailActions = dynamic(
  () =>
    import('@/components/features/reports/ReportDetailActions').then(
      (mod) => mod.ReportDetailActions
    ),
  {
    loading: () => (
      <Card>
        <CardContent className="py-4">
          <div className="h-8 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    ),
  }
);

/**
 * 日報詳細画面 (S-005)
 *
 * 機能:
 * - 日報の詳細表示（基本情報、訪問記録、課題・相談、明日の予定、承認情報）
 * - コメント一覧の表示
 * - コメント投稿フォーム
 * - 編集ボタン（本人 & 編集可能な状態）
 * - 承認ボタン（上長のみ）
 * - 差し戻しボタン（上長のみ）
 *
 * 権限:
 * - 一般営業: 自分の日報のみ閲覧可能
 * - 上長: 自分と配下メンバーの日報を閲覧可能
 */
export default async function ReportDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as SessionUser;
  const params = await props.params;
  const reportId = parseInt(params.id, 10);

  if (isNaN(reportId)) {
    notFound();
  }

  // 日報を取得（訪問記録、コメント含む）
  const report = await prisma.dailyReport.findUnique({
    where: { reportId },
    include: {
      sales: {
        select: {
          salesId: true,
          salesName: true,
          department: true,
        },
      },
      approver: {
        select: {
          salesId: true,
          salesName: true,
        },
      },
      visits: {
        include: {
          customer: {
            select: {
              customerId: true,
              customerName: true,
              companyName: true,
            },
          },
        },
        orderBy: {
          visitTime: 'asc',
        },
      },
      comments: {
        include: {
          sales: {
            select: {
              salesId: true,
              salesName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  // 権限チェック（キャッシュ利用で効率化）
  let hasAccess = false;
  if (report.salesId === user.salesId) {
    hasAccess = true;
  } else if (user.role === ROLES.MANAGER) {
    const allowedIds = await getAllowedSalesIds(user.salesId);
    hasAccess = allowedIds.includes(report.salesId);
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports">&larr; 日報一覧に戻る</Link>
          </Button>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive">
            閲覧権限がありません
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            この日報を閲覧する権限がありません。
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/reports">日報一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 編集可能かどうか
  const canEdit =
    report.salesId === user.salesId &&
    (report.status === REPORT_STATUSES.DRAFT ||
      report.status === REPORT_STATUSES.REJECTED);

  // 承認・差し戻し可能かどうか（上長かつ提出済み）
  const canApprove =
    user.role === ROLES.MANAGER &&
    report.status === REPORT_STATUSES.SUBMITTED &&
    report.salesId !== user.salesId;

  // ステータスに応じたバッジの色
  const getStatusBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case REPORT_STATUSES.DRAFT:
        return 'secondary';
      case REPORT_STATUSES.SUBMITTED:
        return 'default';
      case REPORT_STATUSES.APPROVED:
        return 'outline';
      case REPORT_STATUSES.REJECTED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // 時刻のフォーマット
  const formatTime = (date: Date): string => {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 日時のフォーマット
  const formatDateTime = (date: Date | null): string => {
    if (!date) return '-';
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports">&larr; 日報一覧に戻る</Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">日報詳細</h1>
            <p className="text-muted-foreground mt-2">
              {report.reportDate.toLocaleDateString('ja-JP')} の日報
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button asChild>
                <Link href={`/reports/${reportId}/edit`}>編集</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 基本情報カード */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                営業担当者
              </dt>
              <dd className="mt-1 text-base">{report.sales.salesName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                部署
              </dt>
              <dd className="mt-1 text-base">{report.sales.department}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                報告日
              </dt>
              <dd className="mt-1 text-base">
                {report.reportDate.toLocaleDateString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                ステータス
              </dt>
              <dd className="mt-1">
                <Badge variant={getStatusBadgeVariant(report.status)}>
                  {report.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                提出日時
              </dt>
              <dd className="mt-1 text-base">
                {formatDateTime(report.submittedAt)}
              </dd>
            </div>
            {report.status === REPORT_STATUSES.APPROVED && (
              <>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    承認日時
                  </dt>
                  <dd className="mt-1 text-base">
                    {formatDateTime(report.approvedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    承認者
                  </dt>
                  <dd className="mt-1 text-base">
                    {report.approver?.salesName || '-'}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* 訪問記録カード */}
      <Card>
        <CardHeader>
          <CardTitle>訪問記録 ({report.visits.length}件)</CardTitle>
        </CardHeader>
        <CardContent>
          {report.visits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              訪問記録がありません。
            </p>
          ) : (
            <div className="divide-y">
              {report.visits.map((visit) => (
                <div key={visit.visitId} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatTime(visit.visitTime)}
                        </span>
                        <span className="font-semibold">
                          {visit.customer.companyName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({visit.customer.customerName})
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {visit.visitContent}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 課題・相談 */}
      <Card>
        <CardHeader>
          <CardTitle>課題・相談</CardTitle>
        </CardHeader>
        <CardContent>
          {report.problem ? (
            <p className="whitespace-pre-wrap text-sm">{report.problem}</p>
          ) : (
            <p className="text-sm text-muted-foreground">記載なし</p>
          )}
        </CardContent>
      </Card>

      {/* 明日の予定 */}
      <Card>
        <CardHeader>
          <CardTitle>明日の予定</CardTitle>
        </CardHeader>
        <CardContent>
          {report.plan ? (
            <p className="whitespace-pre-wrap text-sm">{report.plan}</p>
          ) : (
            <p className="text-sm text-muted-foreground">記載なし</p>
          )}
        </CardContent>
      </Card>

      {/* 承認・差し戻しアクション */}
      {canApprove && (
        <ReportDetailActions
          reportId={reportId}
          currentStatus={report.status as ReportStatus}
        />
      )}

      {/* コメントセクション */}
      <CommentSection
        reportId={reportId}
        comments={report.comments.map((c) => ({
          commentId: c.commentId,
          salesId: c.salesId,
          salesName: c.sales.salesName,
          commentContent: c.commentContent,
          createdAt: c.createdAt.toISOString(),
        }))}
        currentUserId={user.salesId}
      />
    </div>
  );
}
