import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SalesForm } from '@/components/features/sales/SalesForm';
import { ROLES } from '@/lib/constants';

/**
 * 営業マスタ登録画面 (S-009)
 *
 * 機能:
 * - 営業担当者情報の新規登録
 * - 営業担当者名、メールアドレス、パスワード、所属部署の入力（必須）
 * - 役割の選択（必須）
 * - 上長の選択（任意）
 *
 * 権限:
 * - 上長のみアクセス可能
 */
export default async function NewSalesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // 権限チェック（上長のみアクセス可）
  const userRole = (session.user as any).role;
  if (userRole !== ROLES.MANAGER) {
    redirect('/dashboard');
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
        <h1 className="text-3xl font-bold tracking-tight">営業担当者登録</h1>
        <p className="text-muted-foreground mt-2">
          新しい営業担当者を登録します
        </p>
      </div>

      {/* 営業担当者フォーム */}
      <SalesForm mode="create" />
    </div>
  );
}
