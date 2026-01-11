'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { loginAction } from './actions/login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * ログイン画面（S-001）
 *
 * メールアドレスとパスワードでシステムへのログイン認証を行う
 *
 * 画面仕様:
 * - 項目ID L-001: メールアドレス（必須、メールアドレス形式）
 * - 項目ID L-002: パスワード（必須、マスク表示）
 * - 項目ID L-003: ログインボタン
 *
 * エラーメッセージ:
 * - E-001: メールアドレスを入力してください。
 * - E-002: メールアドレスの形式が正しくありません。
 * - E-003: パスワードを入力してください。
 * - E-004: メールアドレスまたはパスワードが正しくありません。
 *
 * 遷移先:
 * - 認証成功時: S-002 ダッシュボード
 */
export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      // FormDataを作成
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      // サーバーアクションを実行
      const result = await loginAction(formData);

      if (result?.error) {
        setServerError(result.error);
      }
      // 成功時はサーバーアクション内でリダイレクトされる
    } catch (error) {
      console.error('Login submission error:', error);
      setServerError(
        'システムエラーが発生しました。管理者にお問い合わせください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">営業日報システム</CardTitle>
          <CardDescription>
            メールアドレスとパスワードでログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* サーバーエラー表示 */}
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {/* メールアドレス（L-001） */}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                autoComplete="email"
                disabled={isSubmitting}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* パスワード（L-002） */}
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password')}
              />
              {errors.password && (
                <p
                  id="password-error"
                  className="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ログインボタン（L-003） */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
