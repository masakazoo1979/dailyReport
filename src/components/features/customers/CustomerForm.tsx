'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  customerFormSchema,
  type CustomerFormInput,
} from '@/lib/validations/customer';
import { INDUSTRIES } from '@/lib/constants';

interface CustomerFormProps {
  mode: 'create' | 'edit';
  customerId?: number;
  initialData?: CustomerFormInput;
}

/**
 * 顧客フォームコンポーネント
 *
 * 顧客マスタの登録・編集を行うフォーム
 * - 会社名の入力（必須）
 * - 顧客担当者名の入力（必須）
 * - 業種の選択（任意）
 * - 電話番号の入力（任意）
 * - メールアドレスの入力（任意）
 * - 住所の入力（任意）
 */
export function CustomerForm({
  mode,
  customerId,
  initialData,
}: CustomerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CustomerFormInput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: initialData || {
      companyName: '',
      customerName: '',
      industry: null,
      phone: '',
      email: '',
      address: '',
    },
  });

  /**
   * フォーム送信処理
   */
  const onSubmit = async (data: CustomerFormInput) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const url =
        mode === 'create' ? '/api/customers' : `/api/customers/${customerId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: data.companyName,
          customerName: data.customerName,
          industry: data.industry || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `顧客の${mode === 'create' ? '登録' : '更新'}に失敗しました`
        );
      }

      router.push('/customers');
      router.refresh();
    } catch (err) {
      console.error(`Failed to ${mode} customer:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `顧客の${mode === 'create' ? '登録' : '更新'}に失敗しました`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * キャンセル処理
   */
  const handleCancel = () => {
    router.push('/customers');
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>
                顧客の基本情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 会社名 */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      会社名 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="株式会社サンプル"
                        maxLength={255}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 顧客担当者名 */}
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      顧客担当者名 <span className="text-destructive">*</span>
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

              {/* 業種 */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>業種</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value || null)}
                      value={field.value || undefined}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="業種を選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={INDUSTRIES.IT}>
                          {INDUSTRIES.IT}
                        </SelectItem>
                        <SelectItem value={INDUSTRIES.MANUFACTURING}>
                          {INDUSTRIES.MANUFACTURING}
                        </SelectItem>
                        <SelectItem value={INDUSTRIES.FINANCE}>
                          {INDUSTRIES.FINANCE}
                        </SelectItem>
                        <SelectItem value={INDUSTRIES.RETAIL}>
                          {INDUSTRIES.RETAIL}
                        </SelectItem>
                        <SelectItem value={INDUSTRIES.SERVICE}>
                          {INDUSTRIES.SERVICE}
                        </SelectItem>
                        <SelectItem value={INDUSTRIES.OTHER}>
                          {INDUSTRIES.OTHER}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 連絡先情報 */}
          <Card>
            <CardHeader>
              <CardTitle>連絡先情報</CardTitle>
              <CardDescription>
                顧客の連絡先情報を入力してください（任意）
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 電話番号 */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電話番号</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="03-1234-5678"
                        maxLength={20}
                        {...field}
                        value={field.value || ''}
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
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="sample@example.com"
                        maxLength={255}
                        {...field}
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 住所 */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>住所</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="東京都渋谷区..."
                        className="min-h-[100px] resize-none"
                        maxLength={500}
                        {...field}
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{(field.value || '').length} / 500</span>
                    </div>
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
