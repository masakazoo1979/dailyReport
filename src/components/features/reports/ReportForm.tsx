'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

// 動的インポート: モーダルは使用時のみロード
const VisitModal = lazy(() =>
  import('./VisitModal').then((mod) => ({ default: mod.VisitModal }))
);
import {
  reportFormSchema,
  reportSubmitSchema,
  type ReportFormInput,
  type VisitInput,
} from '@/lib/validations/report';
import { REPORT_STATUSES } from '@/lib/constants';
import { formatDate, getTodayJST } from '@/lib/utils';

interface Customer {
  customerId: number;
  customerName: string;
  companyName: string;
}

interface ReportFormProps {
  customers: Customer[];
}

/**
 * 日報フォームコンポーネント
 *
 * 日報の登録・編集を行うフォーム
 * - 報告日の選択
 * - 訪問記録の追加・編集・削除
 * - 課題・相談の入力
 * - 明日の予定の入力
 * - 下書き保存・提出機能
 */
export function ReportForm({ customers }: ReportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [editingVisitIndex, setEditingVisitIndex] = useState<number | null>(
    null
  );
  const [visits, setVisits] = useState<VisitInput[]>([]);

  const form = useForm<ReportFormInput>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportDate: getTodayJST(),
      visits: [],
      problem: '',
      plan: '',
    },
  });

  /**
   * 訪問記録を追加
   */
  const handleAddVisit = () => {
    setEditingVisitIndex(null);
    setVisitModalOpen(true);
  };

  /**
   * 訪問記録を編集
   */
  const handleEditVisit = (index: number) => {
    setEditingVisitIndex(index);
    setVisitModalOpen(true);
  };

  /**
   * 訪問記録を削除
   */
  const handleDeleteVisit = (index: number) => {
    const newVisits = visits.filter((_, i) => i !== index);
    setVisits(newVisits);
    form.setValue('visits', newVisits);
  };

  /**
   * 訪問記録を保存
   */
  const handleSaveVisit = (visit: VisitInput) => {
    let newVisits: VisitInput[];

    if (editingVisitIndex !== null) {
      // 編集
      newVisits = visits.map((v, i) => (i === editingVisitIndex ? visit : v));
    } else {
      // 追加
      newVisits = [...visits, visit];
    }

    // 訪問時刻でソート
    newVisits.sort((a, b) => a.visitTime.localeCompare(b.visitTime));

    setVisits(newVisits);
    form.setValue('visits', newVisits);
  };

  /**
   * 下書き保存
   */
  const handleSaveDraft = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = form.getValues();

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportDate: formatDate(formData.reportDate),
          problem: formData.problem || null,
          plan: formData.plan || null,
          status: REPORT_STATUSES.DRAFT,
          visits: visits.length > 0 ? visits : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '下書き保存に失敗しました');
      }

      router.push('/reports');
      router.refresh();
    } catch (err) {
      console.error('Failed to save draft:', err);
      setError(err instanceof Error ? err.message : '下書き保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 日報を提出
   */
  const handleSubmit = async (data: ReportFormInput) => {
    setError(null);

    // 提出時は訪問記録が必須
    const submitValidation = reportSubmitSchema.safeParse({
      ...data,
      visits,
    });

    if (!submitValidation.success) {
      const errorMessage = submitValidation.error.errors[0]?.message;
      setError(errorMessage || '入力内容に誤りがあります');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportDate: formatDate(data.reportDate),
          problem: data.problem || null,
          plan: data.plan || null,
          status: REPORT_STATUSES.SUBMITTED,
          visits,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || '日報の提出に失敗しました');
      }

      router.push('/reports');
      router.refresh();
    } catch (err) {
      console.error('Failed to submit report:', err);
      setError(err instanceof Error ? err.message : '日報の提出に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.customerId === customerId);
    return customer
      ? `${customer.companyName} - ${customer.customerName}`
      : '不明な顧客';
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>報告日を選択してください</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="reportDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      報告日 <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : getTodayJST();
                          field.onChange(date);
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 訪問記録 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>訪問記録</CardTitle>
                  <CardDescription>
                    訪問した顧客と内容を記録してください
                    {visits.length === 0 && (
                      <span className="text-destructive">
                        （提出時は1件以上必須）
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVisit}
                  disabled={isSubmitting}
                  aria-label="訪問記録を追加"
                >
                  <PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                  追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {visits.length > 0 ? (
                <Table aria-label="訪問記録一覧">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">訪問時刻</TableHead>
                      <TableHead>訪問先顧客</TableHead>
                      <TableHead>訪問内容</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visits.map((visit, index) => {
                      const customerName = getCustomerName(visit.customerId);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {visit.visitTime}
                          </TableCell>
                          <TableCell>{customerName}</TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {visit.visitContent}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditVisit(index)}
                                disabled={isSubmitting}
                                aria-label={`${visit.visitTime} ${customerName}の訪問記録を編集`}
                              >
                                <EditIcon
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteVisit(index)}
                                disabled={isSubmitting}
                                aria-label={`${visit.visitTime} ${customerName}の訪問記録を削除`}
                              >
                                <TrashIcon
                                  className="h-4 w-4 text-destructive"
                                  aria-hidden="true"
                                />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  訪問記録がありません。「追加」ボタンから訪問記録を追加してください。
                </p>
              )}
            </CardContent>
          </Card>

          {/* 課題・相談 */}
          <Card>
            <CardHeader>
              <CardTitle>課題・相談</CardTitle>
              <CardDescription>
                業務上の課題や相談事項があれば記入してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>課題・相談</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="課題や相談事項を入力してください"
                        className="min-h-[120px] resize-none"
                        maxLength={2000}
                        {...field}
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{field.value?.length || 0} / 2000</span>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 明日の予定 */}
          <Card>
            <CardHeader>
              <CardTitle>明日の予定</CardTitle>
              <CardDescription>
                翌日の活動予定を記入してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>明日の予定</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="明日の予定を入力してください"
                        className="min-h-[120px] resize-none"
                        maxLength={2000}
                        {...field}
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{field.value?.length || 0} / 2000</span>
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
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '下書き保存'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提出中...' : '提出'}
            </Button>
          </div>
        </form>
      </Form>

      {/* 訪問記録モーダル（遅延ロード） */}
      {visitModalOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="animate-pulse rounded-lg bg-white p-8">
                読み込み中...
              </div>
            </div>
          }
        >
          <VisitModal
            open={visitModalOpen}
            onOpenChange={setVisitModalOpen}
            onSave={handleSaveVisit}
            customers={customers}
            initialData={
              editingVisitIndex !== null ? visits[editingVisitIndex] : null
            }
            mode={editingVisitIndex !== null ? 'edit' : 'create'}
          />
        </Suspense>
      )}
    </div>
  );
}
