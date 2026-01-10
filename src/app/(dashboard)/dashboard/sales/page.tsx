import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Sales List Page (Sample)
 *
 * Temporary page to test navigation (Manager only)
 * Based on doc/screen-specification.md S-008
 */
export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">営業マスタ</h1>
          <p className="text-muted-foreground mt-2">
            営業担当者情報を管理できます
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          上長のみ
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>営業担当者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            営業担当者一覧テーブルがここに表示されます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
