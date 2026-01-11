'use client';

/**
 * Reports Filter Component
 *
 * Based on doc/screen-specification.md S-003 日報一覧画面
 *
 * 検索条件:
 * - R-001: 期間(開始) - 初期値: 当月初日
 * - R-002: 期間(終了) - 初期値: 当月末日
 * - R-003: 営業担当者 - 上長のみ表示
 * - R-004: ステータス - 初期値: すべて
 * - R-005: 検索ボタン
 * - R-006: クリアボタン
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  reportsFilterSchema,
  REPORT_STATUSES,
  getDefaultDateRange,
  type ReportsFilter,
} from '@/lib/validations/reports';
import type { SalesOption } from '@/types/reports';

interface ReportsFilterProps {
  /**
   * Current user role
   */
  userRole: '一般' | '上長';

  /**
   * Sales person options (for managers only)
   */
  salesOptions?: SalesOption[];

  /**
   * Default filter values
   */
  defaultValues?: Partial<ReportsFilter>;
}

export function ReportsFilter({
  userRole,
  salesOptions = [],
  defaultValues,
}: ReportsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get default date range
  const defaultDateRange = getDefaultDateRange();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportsFilter>({
    resolver: zodResolver(reportsFilterSchema),
    defaultValues: {
      startDate: searchParams.get('startDate') || defaultDateRange.startDate,
      endDate: searchParams.get('endDate') || defaultDateRange.endDate,
      salesId: searchParams.get('salesId')
        ? Number(searchParams.get('salesId'))
        : undefined,
      status:
        (searchParams.get('status') as ReportsFilter['status']) || 'すべて',
      ...defaultValues,
    },
  });

  /**
   * Handle form submission (R-005: 検索ボタン)
   */
  const onSubmit = (data: ReportsFilter) => {
    const params = new URLSearchParams();

    // Add filter parameters
    if (data.startDate) {
      params.set('startDate', data.startDate);
    }
    if (data.endDate) {
      params.set('endDate', data.endDate);
    }
    if (data.salesId) {
      params.set('salesId', String(data.salesId));
    }
    if (data.status && data.status !== 'すべて') {
      params.set('status', data.status);
    }

    // Reset to page 1 when filtering
    params.set('page', '1');

    // Navigate with new filters
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  /**
   * Handle clear button (R-006: クリアボタン)
   */
  const handleClear = () => {
    const defaultDateRange = getDefaultDateRange();
    reset({
      startDate: defaultDateRange.startDate,
      endDate: defaultDateRange.endDate,
      salesId: undefined,
      status: 'すべて',
    });

    // Navigate to page without filters
    router.push('/dashboard/reports');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">検索条件</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* R-001: 期間(開始) */}
            <div className="space-y-2">
              <Label htmlFor="startDate">期間(開始)</Label>
              <Input
                id="startDate"
                type="date"
                aria-invalid={errors.startDate ? 'true' : 'false'}
                aria-describedby={
                  errors.startDate ? 'startDate-error' : undefined
                }
                {...register('startDate')}
              />
              {errors.startDate && (
                <p
                  id="startDate-error"
                  className="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* R-002: 期間(終了) */}
            <div className="space-y-2">
              <Label htmlFor="endDate">期間(終了)</Label>
              <Input
                id="endDate"
                type="date"
                aria-invalid={errors.endDate ? 'true' : 'false'}
                aria-describedby={errors.endDate ? 'endDate-error' : undefined}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p
                  id="endDate-error"
                  className="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {errors.endDate.message}
                </p>
              )}
            </div>

            {/* R-003: 営業担当者 (上長のみ表示) */}
            {userRole === '上長' && salesOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="salesId">営業担当者</Label>
                <Select
                  value={watch('salesId')?.toString() || ''}
                  onValueChange={(value) => {
                    setValue('salesId', value ? Number(value) : undefined, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger id="salesId">
                    <SelectValue placeholder="全て" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全て</SelectItem>
                    {salesOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* R-004: ステータス */}
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={watch('status') || 'すべて'}
                onValueChange={(value) => {
                  setValue('status', value as ReportsFilter['status'], {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="すべて">すべて</SelectItem>
                  {REPORT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* R-005: 検索ボタン, R-006: クリアボタン */}
          <div className="flex gap-2">
            <Button type="submit">検索</Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              クリア
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
