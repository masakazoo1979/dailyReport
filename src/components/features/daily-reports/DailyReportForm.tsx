'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  dailyReportSchema,
  dailyReportSubmitSchema,
  type DailyReportInput,
} from '@/lib/validations/daily-report';
import {
  saveDraftDailyReport,
  submitDailyReport,
  updateDraftDailyReport,
  updateAndSubmitDailyReport,
} from '@/app/actions/daily-reports';
import { getCustomersForSelect } from '@/app/actions/customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus } from 'lucide-react';
import type { CustomerOption } from '@/types/daily-report';
import type { DailyReport } from '@/types/daily-report';

interface DailyReportFormProps {
  /**
   * 編集モード時の既存日報データ
   */
  existingReport?: DailyReport;
  /**
   * 編集モードかどうか
   */
  isEditMode?: boolean;
}

/**
 * 日報登録・編集フォームコンポーネント（S-004）
 *
 * 画面項目:
 * - DR-001: 報告日
 * - DR-003: 訪問記録一覧
 * - DR-004: 訪問記録追加ボタン
 * - DR-005: 訪問時刻
 * - DR-006: 顧客
 * - DR-007: 訪問内容
 * - DR-008: 課題・相談
 * - DR-009: 明日の予定
 * - DR-010: 下書き保存ボタン
 * - DR-011: 提出ボタン
 * - DR-012: キャンセルボタン
 */
export function DailyReportForm({
  existingReport,
  isEditMode = false,
}: DailyReportFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  // 今日の日付を YYYY-MM-DD 形式で取得
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DailyReportInput>({
    resolver: zodResolver(dailyReportSchema),
    mode: 'onBlur',
    defaultValues: {
      reportDate: existingReport?.reportDate || today,
      problem: existingReport?.problem || '',
      plan: existingReport?.plan || '',
      visits:
        existingReport?.visits.map((v) => ({
          visitId: v.visitId,
          visitTime: v.visitTime,
          customerId: v.customerId,
          visitContent: v.visitContent,
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'visits',
  });

  // 顧客一覧を取得
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      const result = await getCustomersForSelect();
      if (result.success && result.data) {
        setCustomers(result.data);
      } else {
        setServerError(result.error || '顧客一覧の取得に失敗しました');
      }
      setIsLoadingCustomers(false);
    };

    fetchCustomers();
  }, []);

  /**
   * 訪問記録を追加
   */
  const handleAddVisit = () => {
    append({
      visitTime: '',
      customerId: 0,
      visitContent: '',
    });
  };

  /**
   * 訪問記録を削除
   */
  const handleRemoveVisit = (index: number) => {
    remove(index);
  };

  /**
   * 下書き保存
   */
  const handleSaveDraft = async (data: DailyReportInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      const formData = new FormData();
      formData.append('reportDate', data.reportDate);
      formData.append('problem', data.problem || '');
      formData.append('plan', data.plan || '');
      formData.append('visits', JSON.stringify(data.visits));

      let result;
      if (isEditMode && existingReport) {
        result = await updateDraftDailyReport(
          existingReport.reportId,
          formData
        );
      } else {
        result = await saveDraftDailyReport(formData);
      }

      if (result.error) {
        setServerError(result.error);
      } else {
        // 成功時は一覧画面へ遷移
        router.push('/reports');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      setServerError(
        'システムエラーが発生しました。管理者にお問い合わせください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 提出
   */
  const handleSubmitReport = async (data: DailyReportInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      // 提出時のバリデーション（訪問記録1件以上必須）
      const validationResult = dailyReportSubmitSchema.safeParse(data);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        setServerError(firstError.message);
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('reportDate', data.reportDate);
      formData.append('problem', data.problem || '');
      formData.append('plan', data.plan || '');
      formData.append('visits', JSON.stringify(data.visits));

      let result;
      if (isEditMode && existingReport) {
        result = await updateAndSubmitDailyReport(
          existingReport.reportId,
          formData
        );
      } else {
        result = await submitDailyReport(formData);
      }

      if (result.error) {
        setServerError(result.error);
      } else {
        // 成功時は一覧画面へ遷移
        router.push('/reports');
      }
    } catch (error) {
      console.error('Submit report error:', error);
      setServerError(
        'システムエラーが発生しました。管理者にお問い合わせください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * キャンセル
   */
  const handleCancel = () => {
    router.push('/reports');
  };

  return (
    <div className="space-y-6">
      {/* サーバーエラー表示 */}
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-6">
        {/* 報告日（DR-001） */}
        <div className="space-y-2">
          <Label htmlFor="reportDate">
            報告日 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="reportDate"
            type="date"
            disabled={isEditMode || isSubmitting}
            aria-invalid={errors.reportDate ? 'true' : 'false'}
            aria-describedby={
              errors.reportDate ? 'reportDate-error' : undefined
            }
            {...register('reportDate')}
          />
          {errors.reportDate && (
            <p
              id="reportDate-error"
              className="text-sm font-medium text-destructive"
              role="alert"
            >
              {errors.reportDate.message}
            </p>
          )}
        </div>

        {/* ステータス表示（DR-002）- 編集モード時のみ */}
        {isEditMode && existingReport && (
          <div className="space-y-2">
            <Label>ステータス</Label>
            <div className="text-sm font-medium">{existingReport.status}</div>
          </div>
        )}

        {/* 訪問記録（DR-003, DR-004, DR-005, DR-006, DR-007） */}
        <Card>
          <CardHeader>
            <CardTitle>訪問記録</CardTitle>
            <CardDescription>
              訪問した顧客の情報を記録してください（提出時は1件以上必須）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                訪問記録が登録されていません。「訪問記録を追加」ボタンをクリックして追加してください。
              </p>
            )}

            {fields.map((field, index) => (
              <Card key={field.id} className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 訪問時刻（DR-005） */}
                    <div className="space-y-2">
                      <Label htmlFor={`visits.${index}.visitTime`}>
                        訪問時刻 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`visits.${index}.visitTime`}
                        type="time"
                        disabled={isSubmitting}
                        aria-invalid={
                          errors.visits?.[index]?.visitTime ? 'true' : 'false'
                        }
                        {...register(`visits.${index}.visitTime`)}
                      />
                      {errors.visits?.[index]?.visitTime && (
                        <p
                          className="text-sm font-medium text-destructive"
                          role="alert"
                        >
                          {errors.visits[index].visitTime?.message}
                        </p>
                      )}
                    </div>

                    {/* 顧客（DR-006） */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`visits.${index}.customerId`}>
                        顧客 <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name={`visits.${index}.customerId`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            disabled={isSubmitting || isLoadingCustomers}
                            value={field.value?.toString() || ''}
                            onValueChange={(value) =>
                              field.onChange(value ? parseInt(value, 10) : null)
                            }
                          >
                            <SelectTrigger
                              id={`visits.${index}.customerId`}
                              aria-invalid={
                                errors.visits?.[index]?.customerId
                                  ? 'true'
                                  : 'false'
                              }
                            >
                              <SelectValue placeholder="顧客を選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem
                                  key={customer.customerId}
                                  value={customer.customerId.toString()}
                                >
                                  {customer.companyName} -{' '}
                                  {customer.customerName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.visits?.[index]?.customerId && (
                        <p
                          className="text-sm font-medium text-destructive"
                          role="alert"
                        >
                          {errors.visits[index].customerId?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 訪問内容（DR-007） */}
                  <div className="space-y-2">
                    <Label htmlFor={`visits.${index}.visitContent`}>
                      訪問内容 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`visits.${index}.visitContent`}
                      placeholder="訪問内容を入力してください（1000文字以内）"
                      rows={3}
                      disabled={isSubmitting}
                      aria-invalid={
                        errors.visits?.[index]?.visitContent ? 'true' : 'false'
                      }
                      {...register(`visits.${index}.visitContent`)}
                    />
                    {errors.visits?.[index]?.visitContent && (
                      <p
                        className="text-sm font-medium text-destructive"
                        role="alert"
                      >
                        {errors.visits[index].visitContent?.message}
                      </p>
                    )}
                  </div>

                  {/* 削除ボタン */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveVisit(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 訪問記録追加ボタン（DR-004） */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddVisit}
              disabled={isSubmitting || isLoadingCustomers}
            >
              <Plus className="mr-2 h-4 w-4" />
              訪問記録を追加
            </Button>
          </CardContent>
        </Card>

        {/* 課題・相談（DR-008） */}
        <div className="space-y-2">
          <Label htmlFor="problem">課題・相談</Label>
          <Textarea
            id="problem"
            placeholder="課題や相談事項を入力してください（2000文字以内）"
            rows={4}
            disabled={isSubmitting}
            aria-invalid={errors.problem ? 'true' : 'false'}
            aria-describedby={errors.problem ? 'problem-error' : undefined}
            {...register('problem')}
          />
          {errors.problem && (
            <p
              id="problem-error"
              className="text-sm font-medium text-destructive"
              role="alert"
            >
              {errors.problem.message}
            </p>
          )}
        </div>

        {/* 明日の予定（DR-009） */}
        <div className="space-y-2">
          <Label htmlFor="plan">明日の予定</Label>
          <Textarea
            id="plan"
            placeholder="明日の予定を入力してください（2000文字以内）"
            rows={4}
            disabled={isSubmitting}
            aria-invalid={errors.plan ? 'true' : 'false'}
            aria-describedby={errors.plan ? 'plan-error' : undefined}
            {...register('plan')}
          />
          {errors.plan && (
            <p
              id="plan-error"
              className="text-sm font-medium text-destructive"
              role="alert"
            >
              {errors.plan.message}
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4">
          {/* 下書き保存ボタン（DR-010） */}
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(handleSaveDraft)}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '下書き保存'}
          </Button>

          {/* 提出ボタン（DR-011） */}
          <Button
            type="button"
            onClick={handleSubmit(handleSubmitReport)}
            disabled={isSubmitting}
          >
            {isSubmitting ? '提出中...' : '提出'}
          </Button>

          {/* キャンセルボタン（DR-012） */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
