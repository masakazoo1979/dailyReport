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

interface SalesFiltersProps {
  salesName: string;
  department: string;
  role: string;
  departmentOptions: readonly FilterOption[];
  roleOptions: readonly FilterOption[];
}

/**
 * 営業マスタ一覧のフィルタコンポーネント（Client Component）
 */
export function SalesFilters({
  salesName: initialSalesName,
  department: initialDepartment,
  role: initialRole,
  departmentOptions,
  roleOptions,
}: SalesFiltersProps) {
  const router = useRouter();

  // フォーム状態
  const [salesName, setSalesName] = useState(initialSalesName);
  const [department, setDepartment] = useState(initialDepartment);
  const [role, setRole] = useState(initialRole);

  // 検索実行
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();

    if (salesName) {
      params.set('salesName', salesName);
    }
    // '_all' は「すべて」を表す内部値なので、パラメータには含めない
    if (department && department !== '_all') {
      params.set('department', department);
    }
    if (role && role !== '_all') {
      params.set('role', role);
    }
    params.set('page', '1');

    router.push(`/sales?${params.toString()}`);
  }, [salesName, department, role, router]);

  // クリア
  const handleClear = useCallback(() => {
    setSalesName('');
    setDepartment('');
    setRole('');
    router.push('/sales');
  }, [router]);

  // Enterキーで検索実行
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 担当者名 */}
        <div className="space-y-2">
          <Label htmlFor="salesName">担当者名</Label>
          <Input
            id="salesName"
            type="text"
            placeholder="担当者名で検索"
            value={salesName}
            onChange={(e) => setSalesName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* 部署 */}
        <div className="space-y-2">
          <Label htmlFor="department">部署</Label>
          <Select value={department || '_all'} onValueChange={setDepartment}>
            <SelectTrigger id="department" className="w-full">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((option) => (
                <SelectItem
                  key={option.value || '_all'}
                  value={option.value || '_all'}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 役割 */}
        <div className="space-y-2">
          <Label htmlFor="role">役割</Label>
          <Select value={role || '_all'} onValueChange={setRole}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem
                  key={option.value || '_all'}
                  value={option.value || '_all'}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
