import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ROLES } from '@/lib/constants';
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
import { Badge } from '@/components/ui/badge';
import { SalesFilters } from './sales-filters';

/**
 * 営業マスタ一覧画面 (S-008)
 *
 * 機能:
 * - 営業担当者情報の一覧表示
 * - フィルタ機能（担当者名、部署、役割）
 * - ソート機能
 * - ページネーション
 *
 * 権限:
 * - 上長のみアクセス可能
 */

interface SearchParams {
  salesName?: string;
  department?: string;
  role?: string;
  page?: string;
  sortBy?: string;
  sortOrder?: string;
}

const PAGE_SIZE = 10;

// 役割の選択肢
const ROLE_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: ROLES.SALES, label: ROLES.SALES },
  { value: ROLES.MANAGER, label: ROLES.MANAGER },
] as const;

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // 権限チェック（上長のみアクセス可）
  const userRole = (session.user as any).role;
  if (userRole !== ROLES.MANAGER) {
    redirect('/dashboard');
  }

  const params = await searchParams;

  // パラメータの取得
  const salesName = params.salesName || '';
  const department = params.department || '';
  const role = params.role || '';
  const page = parseInt(params.page || '1', 10);
  const sortBy = params.sortBy || 'salesName';
  const sortOrder = (params.sortOrder || 'asc') as 'asc' | 'desc';

  try {
    // 部署の選択肢を取得
    const departments = await prisma.sales.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });

    const departmentOptions = [
      { value: '', label: 'すべて' },
      ...departments.map((d) => ({ value: d.department, label: d.department })),
    ];

    // 検索条件の構築
    const where = {
      ...(salesName && {
        salesName: { contains: salesName },
      }),
      ...(department && { department }),
      ...(role && { role }),
    };

    // ソート条件の構築
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder,
    };

    // 総件数取得とデータ取得を並列実行
    const [totalCount, salesList] = await Promise.all([
      prisma.sales.count({ where }),
      prisma.sales.findMany({
        where,
        select: {
          salesId: true,
          salesName: true,
          email: true,
          department: true,
          role: true,
          managerId: true,
          manager: {
            select: {
              salesId: true,
              salesName: true,
            },
          },
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
              営業マスタ一覧
            </h1>
            <p className="text-muted-foreground mt-2">
              営業担当者情報の管理ができます
            </p>
          </div>
          <Button asChild>
            <Link href="/sales/new">新規営業担当者登録</Link>
          </Button>
        </div>

        {/* 検索フィルタ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">検索条件</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesFilters
              salesName={salesName}
              department={department}
              role={role}
              departmentOptions={departmentOptions}
              roleOptions={ROLE_OPTIONS}
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
            {salesList.length > 0 ? (
              <>
                <Table aria-label="営業担当者一覧">
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortableHeader
                          label="担当者名"
                          field="salesName"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="部署"
                          field="department"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="役割"
                          field="role"
                          currentSort={sortBy}
                          currentOrder={sortOrder}
                          params={params}
                        />
                      </TableHead>
                      <TableHead>上長</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesList.map((sales) => (
                      <TableRow key={sales.salesId}>
                        <TableCell className="font-medium">
                          {sales.salesName}
                        </TableCell>
                        <TableCell>{sales.department}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sales.role === ROLES.MANAGER
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {sales.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{sales.manager?.salesName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/sales/${sales.salesId}/edit`}
                                aria-label={`${sales.salesName}を編集`}
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
                該当する営業担当者がいません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch sales list:', error);
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
            <Link href="/sales">再読み込み</Link>
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
  if (params.salesName) queryParams.set('salesName', params.salesName);
  if (params.department) queryParams.set('department', params.department);
  if (params.role) queryParams.set('role', params.role);
  queryParams.set('sortBy', field);
  queryParams.set('sortOrder', nextOrder);
  queryParams.set('page', '1');

  return (
    <Link
      href={`/sales?${queryParams.toString()}`}
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
    if (params.salesName) queryParams.set('salesName', params.salesName);
    if (params.department) queryParams.set('department', params.department);
    if (params.role) queryParams.set('role', params.role);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    queryParams.set('page', page.toString());
    return `/sales?${queryParams.toString()}`;
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
