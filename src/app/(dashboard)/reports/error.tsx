'use client';

/**
 * Error boundary for Reports List page
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Reports list error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">日報一覧</h1>
        <p className="text-muted-foreground">日報の検索・閲覧ができます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            エラーが発生しました
          </CardTitle>
          <CardDescription>
            日報の読み込み中に問題が発生しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー詳細</AlertTitle>
            <AlertDescription>
              {error.message ||
                'システムエラーが発生しました。管理者にお問い合わせください。'}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={reset}>再試行</Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/dashboard')}
            >
              ダッシュボードに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
