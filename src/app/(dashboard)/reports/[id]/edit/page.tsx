import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { ReportEditForm } from '@/components/features/reports/ReportEditForm';
import { REPORT_STATUSES } from '@/lib/constants';

/**
 * 日報編集画面 (S-005)
 *
 * 機能:
 * - 日報の編集
 * - 報告日は編集不可（表示のみ）
 * - 訪問記録の追加・編集・削除
 * - 課題・相談の編集
 * - 明日の予定の編集
 * - 下書き保存機能
 * - 提出機能（訪問記録1件以上必須）
 * - 再提出機能（差し戻しの場合）
 *
 * 権限:
 * - 自分の日報のみ編集可能
 * - ステータスが「下書き」または「差し戻し」の日報のみ編集可能
 * - ステータスが「提出済み」「承認済み」の場合は詳細画面にリダイレクト
 */
export default async function EditReportPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as SessionUser;
  const reportId = parseInt(params.id, 10);

  if (isNaN(reportId)) {
    redirect('/reports');
  }

  try {
    // 日報を取得（訪問記録含む）
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      include: {
        sales: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
        visits: {
          include: {
            customer: {
              select: {
                customerId: true,
                customerName: true,
                companyName: true,
              },
            },
          },
          orderBy: {
            visitTime: 'asc',
          },
        },
      },
    });

    if (!report) {
      return (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports">← 日報一覧に戻る</Link>
            </Button>
          </div>
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">
              日報が見つかりません
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              指定された日報は存在しません。
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/reports">日報一覧に戻る</Link>
            </Button>
          </div>
        </div>
      );
    }

    // 権限チェック（自分の日報のみ）
    if (report.salesId !== user.salesId) {
      return (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports">← 日報一覧に戻る</Link>
            </Button>
          </div>
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h2 className="text-lg font-semibold text-destructive">
              編集権限がありません
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              この日報は編集できません。
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/reports">日報一覧に戻る</Link>
            </Button>
          </div>
        </div>
      );
    }

    // ステータスチェック（下書き・差し戻しのみ編集可能）
    if (
      report.status !== REPORT_STATUSES.DRAFT &&
      report.status !== REPORT_STATUSES.REJECTED
    ) {
      // 編集不可の場合は詳細画面にリダイレクト
      redirect(`/reports/${reportId}`);
    }

    // 顧客一覧を取得
    const customers = await prisma.customer.findMany({
      select: {
        customerId: true,
        customerName: true,
        companyName: true,
        industry: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    });

    if (customers.length === 0) {
      return (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reports">← 日報一覧に戻る</Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">日報編集</h1>
            <p className="text-muted-foreground mt-2">日報を編集します</p>
          </div>

          <div className="rounded-lg border border-amber-600 bg-amber-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-amber-900">
              顧客データが登録されていません
            </h2>
            <p className="mt-2 text-sm text-amber-700">
              訪問記録を追加するには、最初に顧客マスタに顧客を登録してください。
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
          <h1 className="text-3xl font-bold tracking-tight">日報編集</h1>
          <p className="text-muted-foreground mt-2">
            日報を編集します（報告日:{' '}
            {report.reportDate.toLocaleDateString('ja-JP')}）
          </p>
        </div>

        {/* 差し戻し時のメッセージ */}
        {report.status === REPORT_STATUSES.REJECTED && (
          <div className="rounded-lg border border-amber-600 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              この日報は差し戻されています。内容を修正して再提出してください。
            </p>
          </div>
        )}

        {/* 日報編集フォーム */}
        <ReportEditForm
          reportId={reportId}
          initialData={{
            reportDate: report.reportDate,
            problem: report.problem,
            plan: report.plan,
            status: report.status as any,
            visits: report.visits,
          }}
          customers={customers}
        />
      </div>
    );
  } catch (error) {
    console.error('Failed to load edit report page:', error);
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
            <Link href={`/reports/${reportId}/edit`}>再読み込み</Link>
          </Button>
        </div>
      </div>
    );
  }
}
