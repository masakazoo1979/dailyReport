import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ROLES, REPORT_STATUSES } from '@/lib/constants';
import {
  formatDate,
  getTodayJST,
  getFirstDayOfMonthJST,
  getLastDayOfMonthJST,
} from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/features/status-badge';

/**
 * ダッシュボード画面 (S-002)
 *
 * 機能:
 * - ようこそメッセージ表示
 * - 本日の日報状況表示
 * - 承認待ち日報一覧（上長のみ）
 * - 最近の日報一覧
 * - サマリーカード（今月の統計）
 */
export default async function DashboardPage() {
  // セッション取得（認証済みであることは layout.tsx で保証されている）
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as SessionUser;

  // JSTでの今日の日付と月初・月末を取得
  const today = getTodayJST();
  const firstDayOfMonth = getFirstDayOfMonthJST();
  const lastDayOfMonth = getLastDayOfMonthJST();

  try {
    // 基本データを並列で取得
    const [todayReport, recentReports, monthlyStats, monthlyVisitCount] =
      await Promise.all([
        // 本日の日報を取得
        prisma.dailyReport.findFirst({
          where: {
            salesId: user.salesId,
            reportDate: today,
          },
        }),
        // 最近の日報を取得（直近5件）
        prisma.dailyReport.findMany({
          where: {
            salesId: user.salesId,
          },
          orderBy: {
            reportDate: 'desc',
          },
          take: 5,
        }),
        // 今月の統計を取得
        prisma.dailyReport.groupBy({
          by: ['status'],
          where: {
            salesId: user.salesId,
            reportDate: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
          _count: true,
        }),
        // 今月の訪問件数を取得
        prisma.visit.count({
          where: {
            dailyReport: {
              salesId: user.salesId,
              reportDate: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth,
              },
            },
          },
        }),
      ]);

    // 承認待ち日報を取得（上長のみ）
    let pendingReports: Array<{
      reportId: number;
      reportDate: Date;
      sales: {
        salesName: string;
      };
    }> = [];

    if (user.role === ROLES.MANAGER) {
      // 配下メンバーのIDを取得
      const subordinates = await prisma.sales.findMany({
        where: {
          managerId: user.salesId,
        },
        select: {
          salesId: true,
        },
      });

      const subordinateIds = subordinates.map((s) => s.salesId);

      // 承認待ち日報を取得
      pendingReports = await prisma.dailyReport.findMany({
        where: {
          salesId: {
            in: subordinateIds,
          },
          status: REPORT_STATUSES.SUBMITTED,
        },
        include: {
          sales: {
            select: {
              salesName: true,
            },
          },
        },
        orderBy: {
          reportDate: 'desc',
        },
      });
    }

    // 統計データを整形
    const submittedCount =
      monthlyStats.find((s) => s.status === REPORT_STATUSES.SUBMITTED)
        ?._count ?? 0;
    const approvedCount =
      monthlyStats.find((s) => s.status === REPORT_STATUSES.APPROVED)?._count ??
      0;

    return (
      <div className="container mx-auto space-y-6 p-6">
        {/* ようこそメッセージ */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            ようこそ、{user.name}さん
          </h1>
          <p className="text-muted-foreground mt-2">
            本日の日報状況と最近の活動を確認できます
          </p>
        </div>

        {/* サマリーカード */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                今月の提出済み日報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{submittedCount}件</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                今月の承認済み日報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvedCount}件</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                今月の訪問件数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyVisitCount}件</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 本日の日報 */}
          <Card>
            <CardHeader>
              <CardTitle>本日の日報</CardTitle>
              <CardDescription>{formatDate(today)} の日報状況</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayReport ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      ステータス:
                    </span>
                    <StatusBadge status={todayReport.status} />
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/reports/${todayReport.reportId}/edit`}>
                      日報を編集
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    本日の日報はまだ作成されていません
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/reports/new">日報を作成</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* 承認待ち日報（上長のみ） */}
          {user.role === ROLES.MANAGER && (
            <Card>
              <CardHeader>
                <CardTitle>承認待ち日報</CardTitle>
                <CardDescription>
                  配下メンバーの提出済み日報一覧
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingReports.length > 0 ? (
                  <ul className="space-y-3">
                    {pendingReports.map((report) => (
                      <li
                        key={report.reportId}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {formatDate(report.reportDate)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {report.sales.salesName}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/reports/${report.reportId}`}>詳細</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    承認待ちの日報はありません
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 最近の日報 */}
          <Card className={user.role === ROLES.MANAGER ? 'md:col-span-2' : ''}>
            <CardHeader>
              <CardTitle>最近の日報</CardTitle>
              <CardDescription>直近5件の日報</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length > 0 ? (
                <ul className="space-y-3">
                  {recentReports.map((report) => (
                    <li
                      key={report.reportId}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {formatDate(report.reportDate)}
                        </span>
                        <StatusBadge status={report.status} />
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/reports/${report.reportId}`}>詳細</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  日報がまだありません
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive">
            データの取得に失敗しました
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            しばらくしてから再度お試しください。問題が解決しない場合は管理者にお問い合わせください。
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/dashboard">再読み込み</Link>
          </Button>
        </div>
      </div>
    );
  }
}
