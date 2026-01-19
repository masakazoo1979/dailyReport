import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/components/features/customers/CustomerForm';

/**
 * 顧客マスタ登録画面 (S-007)
 *
 * 機能:
 * - 顧客情報の新規登録
 * - 会社名、顧客担当者名の入力（必須）
 * - 業種、電話番号、メールアドレス、住所の入力（任意）
 *
 * 権限:
 * - すべての認証済みユーザーがアクセス可能
 */
export default async function NewCustomerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">← 顧客一覧に戻る</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">顧客登録</h1>
        <p className="text-muted-foreground mt-2">新しい顧客を登録します</p>
      </div>

      {/* 顧客フォーム */}
      <CustomerForm mode="create" />
    </div>
  );
}
