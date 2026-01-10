import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Customers List Page (Sample)
 *
 * Temporary page to test navigation
 * Based on doc/screen-specification.md S-006
 */
export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">顧客マスタ</h1>
        <p className="text-muted-foreground mt-2">顧客情報を管理できます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>顧客一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            顧客一覧テーブルがここに表示されます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
