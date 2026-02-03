import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CustomerFilters } from './customer-filters';

/**
 * 顧客マスタ一覧画面 (S-006)
 *
 * 機能:
 * - 顧客情報の一覧表示
 * - フィルタ機能（会社名、業種）
 * - ソート機能
 * - ページネーション
 */

interface SearchParams {
  companyName?: string;
  industry?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
}

const PAGE_SIZE = 10;

// 業種の選択肢
const INDUSTRY_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'IT', label: 'IT' },
  { value: '製造', label: '製造' },
  { value: '金融', label: '金融' },
  { value: '小売', label: '小売' },
  { value: 'サービス', label: 'サービス' },
  { value: 'その他', label: 'その他' },
] as const;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const params = await searchParams;

  // パラメータの取得
  const companyName = params.companyName || '';
  const industry = params.industry || '';
  const page = parseInt(params.page || '1', 10);
  const sortBy = params.sortBy || 'companyName';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  try {
    // 検索条件の構築
    const where = {
      ...(companyName && {
        companyName: { contains: companyName },
      }),
      ...(industry && { industry }),
    };

    // ソート条件の構築
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder,
    };

    // 総件数取得とデータ取得を並列実行
    const [totalCount, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        select: {
          customerId: true,
          customerName: true,
          companyName: true,
          industry: true,
          phone: true,
          email: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
      <div className="container mx-auto space-y-6 p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              顧客マスタ一覧
            </h1>
            <p className="text-muted-foreground mt-2">
              顧客情報の検索・閲覧ができます
            </p>
          </div>
          <Button asChild>
            <Link href="/customers/new">新規顧客登録</Link>
          </Button>
        </div>

        {/* 検索フィルタ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">検索条件</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerFilters
              companyName={companyName}
              industry={industry}
              industryOptions={INDUSTRY_OPTIONS}
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
            {customers.length > 0 ? (
              <>
                <Table aria-label="顧客一覧">
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortableHeader
                          label="会社名"
                          field="companyName"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="顧客担当者名"
                          field="customerName"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="業種"
                          field="industry"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      <TableHead>電話番号</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell className="font-medium">
                          {customer.companyName}
                        </TableCell>
                        <TableCell>{customer.customerName}</TableCell>
                        <TableCell>{customer.industry || '-'}</TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/customers/${customer.customerId}`}
                                aria-label={`${customer.companyName}の詳細を表示`}
                              >
                                詳細
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/customers/${customer.customerId}/edit`}
                                aria-label={`${customer.companyName}を編集`}
                              >
                                編集
                              </Link>
                            </Button>
                          </div>
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
                該当する顧客がありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch customers:', error);
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
            <Link href="/customers">再読み込み</Link>
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
  const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc';

  const queryParams = new URLSearchParams();
  if (params.companyName) queryParams.set('companyName', params.companyName);
  if (params.industry) queryParams.set('industry', params.industry);
  queryParams.set('sortBy', field);
  queryParams.set('sortOrder', nextOrder);
  queryParams.set('page', '1');

  return (
    <Link
      href={`/customers?${queryParams.toString()}`}
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
    if (params.companyName) queryParams.set('companyName', params.companyName);
    if (params.industry) queryParams.set('industry', params.industry);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    queryParams.set('page', page.toString());
    return `/customers?${queryParams.toString()}`;
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
