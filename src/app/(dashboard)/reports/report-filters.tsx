'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
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

interface FilterOption {
  value: string;
  label: string;
}

interface ReportFiltersProps {
  startDate: string;
  endDate: string;
  status: string;
  salesId: string;
  statusOptions: FilterOption[];
  salesList: FilterOption[];
  isManager: boolean;
}

/**
 * 日報一覧のフィルタコンポーネント（Client Component）
 */
export function ReportFilters({
  startDate: initialStartDate,
  endDate: initialEndDate,
  status: initialStatus,
  salesId: initialSalesId,
  statusOptions,
  salesList,
  isManager,
}: ReportFiltersProps) {
  const router = useRouter();

  // フォーム状態
  const [startDate, setStartDate] = useState(
    convertDisplayToInputDate(initialStartDate)
  );
  const [endDate, setEndDate] = useState(
    convertDisplayToInputDate(initialEndDate)
  );
  const [status, setStatus] = useState(initialStatus);
  const [salesId, setSalesId] = useState(initialSalesId);

  // YYYY/MM/DD形式をYYYY-MM-DD形式に変換
  function convertDisplayToInputDate(displayDate: string): string {
    return displayDate.replace(/\//g, '-');
  }

  // 検索実行
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();

    if (startDate) {
      params.set('startDate', startDate);
    }
    if (endDate) {
      params.set('endDate', endDate);
    }
    // '_all' は「すべて」を表す内部値なので、パラメータには含めない
    if (status && status !== '_all') {
      params.set('status', status);
    }
    if (salesId && salesId !== '_all') {
      params.set('salesId', salesId);
    }
    params.set('page', '1');

    router.push(`/reports?${params.toString()}`);
  }, [startDate, endDate, status, salesId, router]);

  // クリア
  const handleClear = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setStatus('');
    setSalesId('');
    router.push('/reports');
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 期間（開始） */}
        <div className="space-y-2">
          <Label htmlFor="startDate">期間（開始）</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* 期間（終了） */}
        <div className="space-y-2">
          <Label htmlFor="endDate">期間（終了）</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* ステータス */}
        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value || '_all'}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 営業担当者（上長のみ表示） */}
        {isManager && (
          <div className="space-y-2">
            <Label htmlFor="salesId">営業担当者</Label>
            <Select value={salesId} onValueChange={setSalesId}>
              <SelectTrigger id="salesId" className="w-full">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">すべて</SelectItem>
                {salesList.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-2">
        <Button onClick={handleSearch}>検索</Button>
        <Button variant="outline" onClick={handleClear}>
          クリア
        </Button>
      </div>
    </div>
  );
}
