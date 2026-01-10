import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Reports List Page (Sample)
 *
 * Temporary page to test navigation
 * Based on doc/screen-specification.md S-003
 */
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">日報一覧</h1>
        <p className="text-muted-foreground mt-2">
          過去の日報を検索・閲覧できます
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索条件</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            検索フォームがここに表示されます
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>検索結果</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            日報一覧テーブルがここに表示されます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
