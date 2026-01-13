import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { CustomersFilter } from '@/components/features/customers/CustomersFilter';
import { CustomersTable } from '@/components/features/customers/CustomersTable';
import { fetchCustomers } from './actions';
import type { CustomersListPageProps } from '@/types/customers';

/**
 * Customer Master List Screen (S-006)
 *
 * Based on doc/screen-specification.md S-006 顧客マスタ一覧画面
 *
 * Features:
 * - Search/filter customers by company name and industry
 * - Display customers in table format with sorting
 * - Pagination support (20 items per page)
 * - Access control: All authenticated users
 * - Link to create new customer
 * - Links to detail and edit pages
 *
 * Screen Elements:
 * - C-001: 会社名（検索） - Company name search (partial match)
 * - C-002: 業種（検索） - Industry filter
 * - C-003: 検索ボタン - Search button
 * - C-004: クリアボタン - Clear button
 * - C-005: 新規顧客登録ボタン - Create new customer button
 * - C-006: 検索結果一覧 - Search results table with pagination
 *
 * Layout:
 * ```
 * +--------------------------------------------------+
 * | ヘッダー [ログアウト]                              |
 * +--------------------------------------------------+
 * | ナビゲーション                                     |
 * +--------------------------------------------------+
 * | 【顧客検索】                                       |
 * | 会社名: [              ]                         |
 * | 業種: [▼すべて]                                   |
 * | [検索] [クリア]                                   |
 * |                                                  |
 * | [新規顧客登録]                                    |
 * |                                                  |
 * | 【検索結果】 全 XX件                              |
 * | +------------------------------------------+     |
 * | | 会社名 | 顧客名 | 業種 | 電話 | 操作    |     |
 * | +------------------------------------------+     |
 * | | ABC株式会社 | 山田 | IT | 03-xxxx | [詳細][編集] |
 * | +------------------------------------------+     |
 * | [< 前へ] [1] [2] [3] [次へ >]                   |
 * +--------------------------------------------------+
 * ```
 */
export default async function CustomersListPage({
  searchParams,
}: CustomersListPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">顧客マスタ一覧</h1>
          <p className="text-muted-foreground">
            顧客情報の検索・閲覧ができます
          </p>
        </div>

        {/* C-005: 新規顧客登録ボタン */}
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            新規顧客登録
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Suspense fallback={<FiltersSkeleton />}>
        <CustomersFilter />
      </Suspense>

      {/* Results Table */}
      <Suspense fallback={<TableSkeleton />}>
        <CustomersTableSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * Customers Table Section (Server Component)
 */
async function CustomersTableSection({
  searchParams,
}: {
  searchParams?: CustomersListPageProps['searchParams'];
}) {
  // Build URLSearchParams from searchParams
  const params = new URLSearchParams();
  if (searchParams?.company_name)
    params.set('company_name', searchParams.company_name);
  if (searchParams?.industry) params.set('industry', searchParams.industry);
  if (searchParams?.page) params.set('page', searchParams.page);
  if (searchParams?.per_page) params.set('per_page', searchParams.per_page);
  if (searchParams?.sort) params.set('sort', searchParams.sort);
  if (searchParams?.order) params.set('order', searchParams.order);

  // Fetch customers
  const { data: customers, pagination } = await fetchCustomers(params);

  // Get current sort configuration
  const sort = {
    field: searchParams?.sort || 'company_name',
    order: (searchParams?.order as 'asc' | 'desc') || 'asc',
  };

  return (
    <CustomersTable customers={customers} pagination={pagination} sort={sort} />
  );
}

/**
 * Loading skeleton for filters
 */
function FiltersSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
