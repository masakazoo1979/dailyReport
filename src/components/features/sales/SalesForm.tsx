'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROLES, type Role } from '@/lib/constants';

// フォームのバリデーションスキーマ
const salesFormSchema = z.object({
  salesName: z
    .string()
    .min(1, '営業担当者名を入力してください。')
    .max(100, '営業担当者名は100文字以内で入力してください。'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('メールアドレスの形式が正しくありません。')
    .max(255, 'メールアドレスは255文字以内で入力してください。'),
  password: z.string().optional(),
  department: z
    .string()
    .min(1, '所属部署を入力してください。')
    .max(100, '所属部署は100文字以内で入力してください。'),
  role: z.enum([ROLES.MANAGER, ROLES.SALES], {
    errorMap: () => ({ message: '役割を選択してください。' }),
  }),
  managerId: z.string().optional(),
});

type SalesFormInput = z.infer<typeof salesFormSchema>;

interface Manager {
  salesId: number;
  salesName: string;
}

interface SalesFormProps {
  mode: 'create' | 'edit';
  salesId?: number;
  initialData?: {
    salesName: string;
    email: string;
    department: string;
    role: Role;
    managerId: number | null;
  };
}

/**
 * 営業担当者フォームコンポーネント
 *
 * 営業マスタの登録・編集を行うフォーム
 * - 営業担当者名の入力（必須）
 * - メールアドレスの入力（必須）
 * - パスワードの入力（新規登録時のみ必須）
 * - 所属部署の入力（必須）
 * - 役割の選択（必須）
 * - 上長の選択（任意）
 */
export function SalesForm({ mode, salesId, initialData }: SalesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);

  const form = useForm<SalesFormInput>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: initialData
      ? {
          salesName: initialData.salesName,
          email: initialData.email,
          password: '',
          department: initialData.department,
          role: initialData.role,
          managerId: initialData.managerId?.toString() || '',
        }
      : {
          salesName: '',
          email: '',
          password: '',
          department: '',
          role: ROLES.SALES,
          managerId: '',
        },
  });

  // 上長一覧を取得
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch('/api/sales?role=' + ROLES.MANAGER);
        if (response.ok) {
          const result = await response.json();
          // 編集時は自分自身を除外
          const filteredManagers = result.data.filter(
            (m: Manager & { role: string }) =>
              m.role === ROLES.MANAGER && m.salesId !== salesId
          );
          setManagers(filteredManagers);
        }
      } catch (err) {
        console.error('Failed to fetch managers:', err);
      } finally {
        setIsLoadingManagers(false);
      }
    };

    fetchManagers();
  }, [salesId]);

  /**
   * フォーム送信処理
   */
  const onSubmit = async (data: SalesFormInput) => {
    setError(null);

    // 新規作成時はパスワード必須
    if (mode === 'create' && (!data.password || data.password.length < 8)) {
      form.setError('password', {
        type: 'manual',
        message: 'パスワードは8文字以上で入力してください。',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = mode === 'create' ? '/api/sales' : `/api/sales/${salesId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const requestBody: Record<string, unknown> = {
        salesName: data.salesName,
        email: data.email,
        department: data.department,
        role: data.role,
        managerId: data.managerId ? parseInt(data.managerId, 10) : null,
      };

      // 新規作成時のみパスワードを含める
      if (mode === 'create') {
        requestBody.password = data.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `営業担当者の${mode === 'create' ? '登録' : '更新'}に失敗しました`
        );
      }

      router.push('/sales');
      router.refresh();
    } catch (err) {
      console.error(`Failed to ${mode} sales:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `営業担当者の${mode === 'create' ? '登録' : '更新'}に失敗しました`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * キャンセル処理
   */
  const handleCancel = () => {
    router.push('/sales');
  };

  return (
    <div className="space-y-6">
      {/* エラーメッセージ */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                営業担当者の基本情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 営業担当者名 */}
              <FormField
                control={form.control}
                name="salesName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      営業担当者名 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="山田 太郎"
                        maxLength={100}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* メールアドレス */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      メールアドレス <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="yamada@example.com"
                        maxLength={255}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* パスワード（新規登録時のみ必須） */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      パスワード{' '}
                      {mode === 'create' && (
                        <span className="text-destructive">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          mode === 'edit' ? '変更しない場合は空欄' : '8文字以上'
                        }
                        maxLength={255}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                    {mode === 'edit' && (
                      <p className="text-xs text-muted-foreground">
                        ※ パスワードの変更は別途管理機能から行ってください
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* 所属部署 */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      所属部署 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="営業1部"
                        maxLength={100}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 権限情報 */}
          <Card>
            <CardHeader>
              <CardTitle>権限情報</CardTitle>
              <CardDescription>役割と上長を設定してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 役割 */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      役割 <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="役割を選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ROLES.SALES}>
                          {ROLES.SALES}
                        </SelectItem>
                        <SelectItem value={ROLES.MANAGER}>
                          {ROLES.MANAGER}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 上長 */}
              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上長</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || '_none'}
                      disabled={isSubmitting || isLoadingManagers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingManagers
                                ? '読み込み中...'
                                : '上長を選択してください'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_none">なし</SelectItem>
                        {managers.map((manager) => (
                          <SelectItem
                            key={manager.salesId}
                            value={manager.salesId.toString()}
                          >
                            {manager.salesName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      ※
                      上長として選択できるのは「上長」の役割を持つユーザーのみです
                    </p>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 送信ボタン */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'create'
                  ? '登録中...'
                  : '更新中...'
                : mode === 'create'
                  ? '登録'
                  : '更新'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
