import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Dashboard Page (Sample)
 *
 * Temporary page to test dashboard layout
 * Based on doc/screen-specification.md S-002 Dashboard
 *
 * TODO: Replace with actual dashboard implementation
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">ようこそ、山田太郎さん</p>
      </div>

      {/* Dashboard cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">本日の日報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">ステータス:</p>
              <Badge variant="secondary">下書き</Badge>
              <button className="mt-4 text-sm text-primary hover:underline">
                日報を作成/編集
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">承認待ち日報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              件の日報が承認待ちです
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">今月の承認済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              件の日報が承認されました
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent reports */}
      <Card>
        <CardHeader>
          <CardTitle>最近の日報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">2024/01/10</p>
                <p className="text-sm text-muted-foreground">
                  訪問3件、新規提案1件
                </p>
              </div>
              <Badge>承認済み</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">2024/01/09</p>
                <p className="text-sm text-muted-foreground">
                  訪問2件、フォローアップ
                </p>
              </div>
              <Badge>承認済み</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">2024/01/08</p>
                <p className="text-sm text-muted-foreground">
                  訪問4件、商談2件
                </p>
              </div>
              <Badge>承認済み</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        This is a placeholder page for testing the dashboard layout.
      </p>
    </div>
  );
}
