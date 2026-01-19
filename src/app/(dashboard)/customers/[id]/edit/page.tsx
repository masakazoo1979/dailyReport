import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/components/features/customers/CustomerForm';
import { type Industry } from '@/lib/constants';

/**
 * 顧客マスタ編集画面 (S-007)
 *
 * 機能:
 * - 顧客情報の編集
 * - 会社名、顧客担当者名の編集（必須）
 * - 業種、電話番号、メールアドレス、住所の編集（任意）
 *
 * 権限:
 * - すべての認証済みユーザーがアクセス可能
 */
export default async function EditCustomerPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const params = await props.params;
  const customerId = parseInt(params.id, 10);

  if (isNaN(customerId)) {
    redirect('/customers');
  }

  try {
    // 顧客情報を取得
    const customer = await prisma.customer.findUnique({
      where: { customerId },
      select: {
        customerId: true,
        customerName: true,
        companyName: true,
        industry: true,
        phone: true,
        email: true,
        address: true,
      },
    });

    if (!customer) {
      return (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customers">← 顧客一覧に戻る</Link>
            </Button>
          </div>
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">
              顧客が見つかりません
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              指定された顧客は存在しません。
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/customers">顧客一覧に戻る</Link>
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
              <Link href="/customers">← 顧客一覧に戻る</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">顧客編集</h1>
          <p className="text-muted-foreground mt-2">
            顧客情報を編集します（{customer.companyName}）
          </p>
        </div>

        {/* 顧客編集フォーム */}
        <CustomerForm
          mode="edit"
          customerId={customerId}
          initialData={{
            companyName: customer.companyName,
            customerName: customer.customerName,
            industry: customer.industry as Industry | null,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
          }}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to load edit customer page:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">← 顧客一覧に戻る</Link>
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
            <Link href={`/customers/${customerId}/edit`}>再読み込み</Link>
          </Button>
        </div>
      </div>
    );
  }
}
