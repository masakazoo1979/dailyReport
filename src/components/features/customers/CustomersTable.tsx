'use client';

/**
 * Customers Table Component
 *
 * Based on doc/screen-specification.md S-006 顧客マスタ一覧画面
 *
 * C-006: 検索結果一覧 - テーブル、ページング対応
 *
 * Displays:
 * - 会社名 (Company Name)
 * - 顧客名 (Customer Name)
 * - 業種 (Industry)
 * - 電話 (Phone)
 * - 操作 (Actions - Detail/Edit links)
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
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Eye,
} from 'lucide-react';
import { getIndustryLabel } from '@/lib/validations/customers';
import type { CustomerListItem, PaginationInfo } from '@/types/customers';

interface CustomersTableProps {
  /**
   * List of customers to display
   */
  customers: CustomerListItem[];

  /**
   * Pagination information
   */
  pagination: PaginationInfo;

  /**
   * Current sort configuration
   */
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export function CustomersTable({
  customers,
  pagination,
  sort = { field: 'company_name', order: 'asc' },
}: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handle sort column click
   */
  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams);

    // Toggle order if same field, otherwise default to asc
    if (sort.field === field) {
      params.set('order', sort.order === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sort', field);
      params.set('order', 'asc');
    }

    router.push(`/dashboard/customers?${params.toString()}`);
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
    router.push(`/dashboard/customers?${params.toString()}`);
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
              {/* 会社名 (Sortable) */}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('company_name')}
                  className="-ml-4 h-auto p-4 font-medium"
                >
                  会社名
                  {getSortIcon('company_name')}
                </Button>
              </TableHead>

              {/* 顧客名 (Sortable) */}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('customer_name')}
                  className="-ml-4 h-auto p-4 font-medium"
                >
                  顧客名
                  {getSortIcon('customer_name')}
                </Button>
              </TableHead>

              {/* 業種 (Sortable) */}
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('industry')}
                  className="-ml-4 h-auto p-4 font-medium"
                >
                  業種
                  {getSortIcon('industry')}
                </Button>
              </TableHead>

              {/* 電話 */}
              <TableHead>電話</TableHead>

              {/* 操作 */}
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  顧客が見つかりませんでした
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  {/* 会社名 */}
                  <TableCell className="font-medium">
                    {customer.company_name}
                  </TableCell>

                  {/* 顧客名 */}
                  <TableCell>{customer.customer_name}</TableCell>

                  {/* 業種 */}
                  <TableCell>{getIndustryLabel(customer.industry)}</TableCell>

                  {/* 電話 */}
                  <TableCell>{customer.phone || '-'}</TableCell>

                  {/* 操作 */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/dashboard/customers/${customer.customer_id}`}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          詳細
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/dashboard/customers/${customer.customer_id}/edit`}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          編集
                        </Link>
                      </Button>
                    </div>
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
