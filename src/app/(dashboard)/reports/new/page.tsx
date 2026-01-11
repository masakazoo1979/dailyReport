import { Metadata } from 'next';
import { DailyReportForm } from '@/components/features/daily-reports/DailyReportForm';

/**
 * 日報登録画面（S-004）
 *
 * 営業担当者が日々の営業活動を記録する画面
 *
 * 主な機能:
 * - 報告日の選択
 * - 訪問記録の登録（複数件可能、動的追加・削除）
 * - 課題・相談の入力
 * - 明日の予定の入力
 * - 下書き保存機能
 * - 提出機能
 *
 * 画面仕様:
 * - 訪問記録は動的に追加・削除可能
 * - 下書き保存時は訪問記録なしでも保存可能
 * - 提出時は訪問記録1件以上必須
 * - 同日の日報重複チェックあり
 *
 * 遷移元:
 * - S-003 日報一覧画面の「新規登録」ボタン
 * - S-002 ダッシュボードの「日報を登録」ボタン
 *
 * 遷移先:
 * - 保存/提出成功時: S-003 日報一覧画面
 * - キャンセル時: S-003 日報一覧画面
 */
export const metadata: Metadata = {
  title: '日報登録 | 営業日報システム',
  description: '営業日報の新規登録画面',
};

export default function NewReportPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">日報登録</h1>
        <p className="text-muted-foreground mt-2">
          日々の営業活動を記録してください
        </p>
      </div>

      <DailyReportForm />
    </div>
  );
}
