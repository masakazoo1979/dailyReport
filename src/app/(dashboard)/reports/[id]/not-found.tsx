import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Home } from 'lucide-react';

/**
 * Not found page for daily report detail
 */
export default function ReportNotFound() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">日報詳細</h1>
          <p className="text-muted-foreground">日報が見つかりません</p>
        </div>
      </div>

      {/* Not Found Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            日報が見つかりません
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            指定された日報は存在しないか、アクセス権限がありません。
          </p>

          <div className="flex gap-3">
            <Button asChild>
              <Link href="/dashboard/reports">
                <Home className="mr-2 h-4 w-4" />
                日報一覧に戻る
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
