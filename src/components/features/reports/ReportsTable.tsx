'use client';

/**
 * Reports Table Component
 *
 * Based on doc/screen-specification.md S-003 日報一覧画面
 *
 * R-008: 検索結果一覧 - テーブル、ページング対応
 *
 * Displays:
 * - 日付 (Report Date)
 * - 営業担当 (Sales Person)
 * - ステータス (Status)
 * - 操作 (Actions - Detail link)
 */

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { getStatusBadgeVariant } from '@/lib/validations/reports';
import type { ReportListItem, PaginationInfo } from '@/types/reports';

interface ReportsTableProps {
  /**
   * List of reports to display
   */
  reports: ReportListItem[];

  /**
   * Pagination information
   */
  pagination: PaginationInfo;

  /**
   * Current user role
   */
  userRole: '一般' | '上長';

  /**
   * Current sort configuration
   */
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export function ReportsTable({
  reports,
  pagination,
  userRole,
  sort = { field: 'report_date', order: 'desc' },
}: ReportsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Format date to YYYY/MM/DD
   */
  const formatDate = (dateString: string): string => {
    return dateString.replace(/-/g, '/');
  };

  /**
   * Format datetime to YYYY/MM/DD HH:MM
   */
  const formatDateTime = (dateTimeString: string | null): string => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Handle sort column click
   */
  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams);

    // Toggle order if same field, otherwise default to desc
    if (sort.field === field) {
      params.set('order', sort.order === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sort', field);
      params.set('order', 'desc');
    }

    router.push(`/reports?${params.toString()}`);
  };

  /**
   * Get sort icon for column
   */
  const getSortIcon = (field: string) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sort.order === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.push(`/reports?${params.toString()}`);
  };

  /**
   * Generate pagination range
   */
  const getPaginationRange = (): number[] => {
    const { page, total_pages } = pagination;
    const delta = 2; // Pages before and after current

    const range: number[] = [];
    const rangeWithDots: number[] = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(total_pages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, -1); // -1 represents "..."
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < total_pages - 1) {
      rangeWithDots.push(-1, total_pages);
    } else if (total_pages > 1) {
      rangeWithDots.push(total_pages);
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        全 {pagination.total} 件
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* 日付 (Sortable) */}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('report_date')}
                  className="-ml-4 h-auto p-4 font-medium"
                >
                  日付
                  {getSortIcon('report_date')}
                </Button>
              </TableHead>

              {/* 営業担当 (Sortable for managers) */}
              {userRole === '上長' && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('sales_name')}
                    className="-ml-4 h-auto p-4 font-medium"
                  >
                    営業担当
                    {getSortIcon('sales_name')}
                  </Button>
                </TableHead>
              )}

              {/* ステータス (Sortable) */}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="-ml-4 h-auto p-4 font-medium"
                >
                  ステータス
                  {getSortIcon('status')}
                </Button>
              </TableHead>

              {/* 提出日時 (Sortable) */}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('submitted_at')}
                  className="-ml-4 h-auto p-4 font-medium"
                >
                  提出日時
                  {getSortIcon('submitted_at')}
                </Button>
              </TableHead>

              {/* 操作 */}
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={userRole === '上長' ? 5 : 4}
                  className="h-24 text-center"
                >
                  日報が見つかりませんでした
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.report_id}>
                  {/* 日付 */}
                  <TableCell className="font-medium">
                    {formatDate(report.report_date)}
                  </TableCell>

                  {/* 営業担当 (上長のみ表示) */}
                  {userRole === '上長' && (
                    <TableCell>{report.sales_name}</TableCell>
                  )}

                  {/* ステータス */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>

                  {/* 提出日時 */}
                  <TableCell>{formatDateTime(report.submitted_at)}</TableCell>

                  {/* 操作 */}
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/reports/${report.report_id}`}>詳細</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            ページ {pagination.page} / {pagination.total_pages}
          </div>

          <div className="flex items-center space-x-2">
            {/* First page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              aria-label="最初のページ"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="前のページ"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {getPaginationRange().map((pageNum, idx) =>
              pageNum === -1 ? (
                <span key={`dots-${idx}`} className="px-2">
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`ページ ${pageNum}`}
                  aria-current={
                    pageNum === pagination.page ? 'page' : undefined
                  }
                >
                  {pageNum}
                </Button>
              )
            )}

            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.total_pages}
              aria-label="次のページ"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.total_pages)}
              disabled={pagination.page === pagination.total_pages}
              aria-label="最後のページ"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
