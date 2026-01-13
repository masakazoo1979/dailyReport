import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDailyReportById } from '@/app/actions/daily-reports';
import { getCustomersForSelect } from '@/app/actions/customers';
import { DailyReportForm } from '@/components/features/daily-reports/DailyReportForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * 日報編集画面（S-004）
 *
 * 既存の日報を編集する画面
 *
 * 主な機能:
 * - 既存日報データの取得と表示
 * - 報告日の表示（編集不可）
 * - 訪問記録の編集（動的追加・削除）
 * - 課題・相談の編集
 * - 明日の予定の編集
 * - 下書き保存機能
 * - 提出機能（再提出含む）
 *
 * 編集制御:
 * - 下書き・差し戻し: 編集可能
 * - 提出済み・承認済み: 編集不可（エラー表示）
 *
 * 遷移元:
 * - S-003 日報一覧画面の「編集」ボタン
 * - S-002 ダッシュボードの日報カードの「編集」ボタン
 *
 * 遷移先:
 * - 保存/提出成功時: S-003 日報一覧画面
 * - キャンセル時: S-003 日報一覧画面
 */

interface EditReportPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: '日報編集 | 営業日報システム',
  description: '営業日報の編集画面',
};

export default async function EditReportPage({ params }: EditReportPageProps) {
  const reportId = parseInt(params.id, 10);

  // IDが無効な場合は404
  if (isNaN(reportId)) {
    notFound();
  }

  // 日報データと顧客一覧を並行して取得
  const [result, customersResult] = await Promise.all([
    getDailyReportById(reportId),
    getCustomersForSelect(),
  ]);

  // エラーの場合
  if (result.error || !result.data) {
    // 日報が見つからない場合は404ページを表示
    if (result.error === '日報が見つかりません') {
      notFound();
    }

    // その他のエラー（権限エラー、システムエラー）はAlert表示
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {result.error || 'データの取得に失敗しました'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 顧客一覧の取得エラー
  if (customersResult.error || !customersResult.data) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {customersResult.error || '顧客一覧の取得に失敗しました'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const report = result.data;
  const customers = customersResult.data;

  // ステータスチェック: 提出済み・承認済みの場合は編集不可
  const isEditable = report.status === '下書き' || report.status === '差し戻し';

  if (!isEditable) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">日報編集</h1>
          <p className="text-muted-foreground mt-2">営業日報の編集画面</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            この日報は編集できません。ステータスが「{report.status}
            」の日報は編集できません。
            編集可能なのは「下書き」または「差し戻し」のステータスの日報のみです。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">日報編集</h1>
        <p className="text-muted-foreground mt-2">営業日報を編集してください</p>
      </div>

      <DailyReportForm
        existingReport={report}
        isEditMode={true}
        customers={customers}
      />
    </div>
  );
}
