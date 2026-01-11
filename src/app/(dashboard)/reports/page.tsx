import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { ReportsFilter } from '@/components/features/reports/ReportsFilter';
import { ReportsTable } from '@/components/features/reports/ReportsTable';
import { fetchReports, fetchSalesOptions } from './actions';
import type { ReportsListPageProps } from '@/types/reports';

/**
 * Daily Reports List Screen (S-003)
 *
 * Based on doc/screen-specification.md S-003 日報一覧画面
 *
 * Features:
 * - Search/filter reports by date range, status, and sales person (managers only)
 * - Display reports in table format with sorting
 * - Pagination support (20 items per page)
 * - Role-based access control:
 *   - 一般営業: Only their own reports
 *   - 上長: Reports of subordinate members
 * - Link to create new report (sales persons only)
 * - Link to report detail page
 *
 * Screen Elements:
 * - R-001: 期間(開始) - Start date filter
 * - R-002: 期間(終了) - End date filter
 * - R-003: 営業担当者 - Sales person filter (managers only)
 * - R-004: ステータス - Status filter
 * - R-005: 検索ボタン - Search button
 * - R-006: クリアボタン - Clear button
 * - R-007: 新規日報作成ボタン - Create new report button (sales persons only)
 * - R-008: 検索結果一覧 - Search results table with pagination
 */
export default async function ReportsListPage({
  searchParams,
}: ReportsListPageProps) {
  // TODO: Replace with actual authentication
  // For now, using mock user data
  // In production, this should fetch from NextAuth session
  const mockUser = {
    salesId: 1,
    role: '一般' as const, // Change to '上長' to test manager view
    managerId: null,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">日報一覧</h1>
          <p className="text-muted-foreground">日報の検索・閲覧ができます</p>
        </div>

        {/* R-007: 新規日報作成ボタン (営業担当者のみ) */}
        <Button asChild>
          <Link href="/dashboard/reports/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            新規日報作成
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Suspense fallback={<FiltersSkeleton />}>
        <ReportsFilterSection
          userRole={mockUser.role}
          searchParams={searchParams}
        />
      </Suspense>

      {/* Results Table */}
      <Suspense fallback={<TableSkeleton />}>
        <ReportsTableSection
          userRole={mockUser.role}
          currentUser={mockUser}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}

/**
 * Reports Filter Section (Server Component)
 */
async function ReportsFilterSection({
  userRole,
}: {
  userRole: '一般' | '上長';
  searchParams?: ReportsListPageProps['searchParams'];
}) {
  // Fetch sales options for managers
  const salesOptions =
    userRole === '上長'
      ? await fetchSalesOptions({
          salesId: 1, // TODO: Replace with actual user ID
          role: userRole,
        })
      : [];

  return <ReportsFilter userRole={userRole} salesOptions={salesOptions} />;
}

/**
 * Reports Table Section (Server Component)
 */
async function ReportsTableSection({
  userRole,
  currentUser,
  searchParams,
}: {
  userRole: '一般' | '上長';
  currentUser: {
    salesId: number;
    role: '一般' | '上長';
    managerId?: number | null;
  };
  searchParams?: ReportsListPageProps['searchParams'];
}) {
  // Build URLSearchParams from searchParams
  const params = new URLSearchParams();
  if (searchParams?.startDate) params.set('startDate', searchParams.startDate);
  if (searchParams?.endDate) params.set('endDate', searchParams.endDate);
  if (searchParams?.salesId) params.set('salesId', searchParams.salesId);
  if (searchParams?.status) params.set('status', searchParams.status);
  if (searchParams?.page) params.set('page', searchParams.page);
  if (searchParams?.perPage) params.set('perPage', searchParams.perPage);
  if (searchParams?.sort) params.set('sort', searchParams.sort);
  if (searchParams?.order) params.set('order', searchParams.order);

  // Fetch reports
  const { data: reports, pagination } = await fetchReports(params, currentUser);

  // Get current sort configuration
  const sort = {
    field: searchParams?.sort || 'report_date',
    order: (searchParams?.order as 'asc' | 'desc') || 'desc',
  };

  return (
    <ReportsTable
      reports={reports}
      pagination={pagination}
      userRole={userRole}
      sort={sort}
    />
  );
}

/**
 * Loading skeleton for filters
 */
function FiltersSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for table
 */
function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="mb-4 h-10 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
