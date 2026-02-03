import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ReportForm } from '@/components/features/reports/ReportForm';
import { getCustomerListForSelect } from '@/lib/utils/cache';

/**
 * 日報登録画面 (S-004)
 *
 * 機能:
 * - 日報の新規登録
 * - 報告日の選択（デフォルトは当日）
 * - 訪問記録の追加・編集・削除
 * - 課題・相談の入力
 * - 明日の予定の入力
 * - 下書き保存機能
 * - 提出機能（訪問記録1件以上必須）
 */
export default async function NewReportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  try {
    // 顧客一覧を取得（キャッシュ利用で効率化）
    const customers = await getCustomerListForSelect();

    if (customers.length === 0) {
      return (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reports">← 日報一覧に戻る</Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">日報登録</h1>
            <p className="text-muted-foreground mt-2">新しい日報を作成します</p>
          </div>

          <div className="rounded-lg border border-amber-600 bg-amber-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-amber-900">
              顧客データが登録されていません
            </h2>
            <p className="mt-2 text-sm text-amber-700">
              日報を作成するには、最初に顧客マスタに顧客を登録してください。
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/reports">日報一覧に戻る</Link>
              </Button>
              <Button asChild>
                <Link href="/customers/new">顧客を登録</Link>
              </Button>
            </div>
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
              <Link href="/reports">← 日報一覧に戻る</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">日報登録</h1>
          <p className="text-muted-foreground mt-2">新しい日報を作成します</p>
        </div>

        {/* 日報フォーム */}
        <ReportForm customers={customers} />
      </div>
    );
  } catch (error) {
    console.error('Failed to load new report page:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports">← 日報一覧に戻る</Link>
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
            <Link href="/reports/new">再読み込み</Link>
          </Button>
        </div>
      </div>
    );
  }
}
