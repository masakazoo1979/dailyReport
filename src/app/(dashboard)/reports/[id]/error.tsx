'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Error boundary for daily report detail page
 */
export default function ReportDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Report detail error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">日報詳細</h1>
          <p className="text-muted-foreground">エラーが発生しました</p>
        </div>
      </div>

      {/* Error Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            エラーが発生しました
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー詳細</AlertTitle>
            <AlertDescription>
              {error.message || '日報の読み込み中にエラーが発生しました'}
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              再試行
            </Button>
            <Button asChild variant="outline">
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
