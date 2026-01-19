import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { SalesForm } from '@/components/features/sales/SalesForm';
import { ROLES, type Role } from '@/lib/constants';

/**
 * 営業マスタ編集画面 (S-009)
 *
 * 機能:
 * - 営業担当者情報の編集
 * - 営業担当者名、メールアドレス、所属部署の編集（必須）
 * - 役割の変更（必須）
 * - 上長の変更（任意）
 *
 * 権限:
 * - 上長のみアクセス可能
 */
export default async function EditSalesPage(props: {
  params: Promise<{ id: string }>;
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

  const params = await props.params;
  const salesId = parseInt(params.id, 10);

  if (isNaN(salesId)) {
    redirect('/sales');
  }

  try {
    // 営業担当者情報を取得
    const sales = await prisma.sales.findUnique({
      where: { salesId },
      select: {
        salesId: true,
        salesName: true,
        email: true,
        department: true,
        role: true,
        managerId: true,
      },
    });

    if (!sales) {
      return (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sales">&larr; 営業一覧に戻る</Link>
            </Button>
          </div>
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">
              営業担当者が見つかりません
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              指定された営業担当者は存在しません。
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/sales">営業一覧に戻る</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto space-y-6 p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sales">&larr; 営業一覧に戻る</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">営業担当者編集</h1>
          <p className="text-muted-foreground mt-2">
            営業担当者情報を編集します（{sales.salesName}）
          </p>
        </div>

        {/* 営業担当者編集フォーム */}
        <SalesForm
          mode="edit"
          salesId={salesId}
          initialData={{
            salesName: sales.salesName,
            email: sales.email,
            department: sales.department,
            role: sales.role as Role,
            managerId: sales.managerId,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to load edit sales page:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sales">&larr; 営業一覧に戻る</Link>
          </Button>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive">
            データの取得に失敗しました
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            しばらくしてから再度お試しください。問題が解決しない場合は管理者にお問い合わせください。
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href={`/sales/${salesId}/edit`}>再読み込み</Link>
          </Button>
        </div>
      </div>
    );
  }
}
