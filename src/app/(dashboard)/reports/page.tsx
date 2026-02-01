import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ROLES, REPORT_STATUSES } from '@/lib/constants';
import {
  formatDate,
  getFirstDayOfMonthJST,
  getLastDayOfMonthJST,
} from '@/lib/utils';
import { getAllowedSalesIds, getSalesListForManager } from '@/lib/utils/cache';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/features/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReportFilters } from './report-filters';

/**
 * 日報一覧画面 (S-003)
 *
 * 機能:
 * - 日報の一覧表示
 * - フィルタ機能（期間、ステータス、営業担当者）
 * - ソート機能
 * - ページネーション
 * - 権限による表示制御
 */

interface SearchParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  salesId?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
}

const PAGE_SIZE = 10;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as SessionUser;
  const params = await searchParams;

  // デフォルト値の設定
  const firstDayOfMonth = getFirstDayOfMonthJST();
  const lastDayOfMonth = getLastDayOfMonthJST();

  const startDate = params.startDate
    ? new Date(params.startDate)
    : firstDayOfMonth;
  const endDate = params.endDate ? new Date(params.endDate) : lastDayOfMonth;
  const status = params.status || '';
  const salesId = params.salesId || '';
  const page = parseInt(params.page || '1', 10);
  const sortBy = params.sortBy || 'reportDate';
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc';

  try {
    // 権限に基づいた営業担当者IDの条件を構築
    let salesIdCondition: number | { in: number[] } | undefined;

    if (user.role === ROLES.MANAGER) {
      // 上長の場合: 配下メンバー + 自分（キャッシュ利用）
      const allowedIds = await getAllowedSalesIds(user.salesId);

      if (salesId && allowedIds.includes(parseInt(salesId, 10))) {
        // 特定の営業担当者でフィルタ
        salesIdCondition = parseInt(salesId, 10);
      } else {
        // 全員を対象
        salesIdCondition = { in: allowedIds };
      }
    } else {
      // 一般営業の場合: 自分の日報のみ
      salesIdCondition = user.salesId;
    }

    // 検索条件の構築
    const where = {
      salesId: salesIdCondition,
      reportDate: {
        gte: startDate,
        lte: endDate,
      },
      ...(status && { status }),
    };

    // ソート条件の構築
    const orderBy: Record<string, 'asc' | 'desc'>[] = [];
    if (sortBy === 'reportDate') {
      orderBy.push({ reportDate: sortOrder });
    } else if (sortBy === 'status') {
      orderBy.push({ status: sortOrder });
    }

    // 総件数取得とデータ取得を並列実行
    const [totalCount, reports, salesList] = await Promise.all([
      prisma.dailyReport.count({ where }),
      prisma.dailyReport.findMany({
        where,
        include: {
          sales: {
            select: {
              salesId: true,
              salesName: true,
            },
          },
          _count: {
            select: {
              visits: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      // 営業担当者リスト取得（上長のみ使用、キャッシュ利用）
      user.role === ROLES.MANAGER
        ? getSalesListForManager(user.salesId)
        : Promise.resolve([]),
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // フィルタに渡すステータスオプション
    const statusOptions = [
      { value: '', label: 'すべて' },
      { value: REPORT_STATUSES.DRAFT, label: REPORT_STATUSES.DRAFT },
      { value: REPORT_STATUSES.SUBMITTED, label: REPORT_STATUSES.SUBMITTED },
      { value: REPORT_STATUSES.APPROVED, label: REPORT_STATUSES.APPROVED },
      { value: REPORT_STATUSES.REJECTED, label: REPORT_STATUSES.REJECTED },
    ];

    return (
      <div className="container mx-auto space-y-6 p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">日報一覧</h1>
            <p className="text-muted-foreground mt-2">
              日報の検索・閲覧ができます
            </p>
          </div>
          <Button asChild>
            <Link href="/reports/new">新規日報作成</Link>
          </Button>
        </div>

        {/* 検索フィルタ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">検索条件</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportFilters
              startDate={formatDate(startDate)}
              endDate={formatDate(endDate)}
              status={status}
              salesId={salesId}
              statusOptions={statusOptions}
              salesList={
                user.role === ROLES.MANAGER
                  ? salesList.map((s) => ({
                      value: s.salesId.toString(),
                      label: s.salesName,
                    }))
                  : []
              }
              isManager={user.role === ROLES.MANAGER}
            />
          </CardContent>
        </Card>

        {/* 検索結果 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">検索結果</CardTitle>
            <CardDescription>全 {totalCount} 件</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length > 0 ? (
              <>
                <Table aria-label="日報一覧">
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortableHeader
                          label="日付"
                          field="reportDate"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      {user.role === ROLES.MANAGER && (
                        <TableHead>営業担当者</TableHead>
                      )}
                      <TableHead>
                        <SortableHeader
                          label="ステータス"
                          field="status"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      <TableHead>訪問件数</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.reportId}>
                        <TableCell className="font-medium">
                          {formatDate(report.reportDate)}
                        </TableCell>
                        {user.role === ROLES.MANAGER && (
                          <TableCell>{report.sales.salesName}</TableCell>
                        )}
                        <TableCell>
                          <StatusBadge status={report.status} />
                        </TableCell>
                        <TableCell>{report._count.visits}件</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/reports/${report.reportId}`}
                              aria-label={`${formatDate(report.reportDate)}の日報を詳細表示`}
                            >
                              詳細
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    params={params}
                  />
                )}
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                該当する日報がありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch reports:', error);
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
            <Link href="/reports">再読み込み</Link>
          </Button>
        </div>
      </div>
    );
  }
}

/**
 * ソート可能なヘッダー
 */
function SortableHeader({
  label,
  field,
  currentSort,
  currentOrder,
  params,
}: {
  label: string;
  field: string;
  currentSort: string;
  currentOrder: string;
  params: SearchParams;
}) {
  const isActive = currentSort === field;
  const nextOrder = isActive && currentOrder === 'desc' ? 'asc' : 'desc';

  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.set('startDate', params.startDate);
  if (params.endDate) queryParams.set('endDate', params.endDate);
  if (params.status) queryParams.set('status', params.status);
  if (params.salesId) queryParams.set('salesId', params.salesId);
  queryParams.set('sortBy', field);
  queryParams.set('sortOrder', nextOrder);
  queryParams.set('page', '1');

  return (
    <Link
      href={`/reports?${queryParams.toString()}`}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {label}
      {isActive && (
        <span className="text-xs">{currentOrder === 'desc' ? '▼' : '▲'}</span>
      )}
    </Link>
  );
}

/**
 * ページネーションコンポーネント
 */
function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number;
  totalPages: number;
  params: SearchParams;
}) {
  const buildPageUrl = (page: number) => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams.set('endDate', params.endDate);
    if (params.status) queryParams.set('status', params.status);
    if (params.salesId) queryParams.set('salesId', params.salesId);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    queryParams.set('page', page.toString());
    return `/reports?${queryParams.toString()}`;
  };

  // 表示するページ番号を計算
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      className="mt-4 flex items-center justify-center gap-2"
      role="navigation"
      aria-label="ページネーション"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        asChild={currentPage !== 1}
        aria-label="前のページ"
      >
        {currentPage === 1 ? (
          <span>前へ</span>
        ) : (
          <Link href={buildPageUrl(currentPage - 1)}>前へ</Link>
        )}
      </Button>

      {getPageNumbers().map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === currentPage ? 'default' : 'outline'}
          size="sm"
          asChild={pageNum !== currentPage}
          aria-label={`ページ${pageNum}`}
          aria-current={pageNum === currentPage ? 'page' : undefined}
        >
          {pageNum === currentPage ? (
            <span>{pageNum}</span>
          ) : (
            <Link href={buildPageUrl(pageNum)}>{pageNum}</Link>
          )}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        asChild={currentPage !== totalPages}
        aria-label="次のページ"
      >
        {currentPage === totalPages ? (
          <span>次へ</span>
        ) : (
          <Link href={buildPageUrl(currentPage + 1)}>次へ</Link>
        )}
      </Button>
    </nav>
  );
}
