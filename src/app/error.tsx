'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { logError } from '@/lib/utils/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logError(error, {
      context: 'GlobalErrorBoundary',
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">
            エラーが発生しました
          </CardTitle>
          <CardDescription>
            申し訳ございません。予期しないエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            問題が解決しない場合は、管理者にお問い合わせください。
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              エラーID: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            ホームに戻る
          </Button>
          <Button onClick={reset}>再試行</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
