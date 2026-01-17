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

interface CustomerFiltersProps {
  companyName: string;
  industry: string;
  industryOptions: readonly FilterOption[];
}

/**
 * 顧客マスタ一覧のフィルタコンポーネント（Client Component）
 */
export function CustomerFilters({
  companyName: initialCompanyName,
  industry: initialIndustry,
  industryOptions,
}: CustomerFiltersProps) {
  const router = useRouter();

  // フォーム状態
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [industry, setIndustry] = useState(initialIndustry);

  // 検索実行
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();

    if (companyName) {
      params.set('companyName', companyName);
    }
    // '_all' は「すべて」を表す内部値なので、パラメータには含めない
    if (industry && industry !== '_all') {
      params.set('industry', industry);
    }
    params.set('page', '1');

    router.push(`/customers?${params.toString()}`);
  }, [companyName, industry, router]);

  // クリア
  const handleClear = useCallback(() => {
    setCompanyName('');
    setIndustry('');
    router.push('/customers');
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
        {/* 会社名 */}
        <div className="space-y-2">
          <Label htmlFor="companyName">会社名</Label>
          <Input
            id="companyName"
            type="text"
            placeholder="会社名で検索"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* 業種 */}
        <div className="space-y-2">
          <Label htmlFor="industry">業種</Label>
          <Select value={industry || '_all'} onValueChange={setIndustry}>
            <SelectTrigger id="industry" className="w-full">
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map((option) => (
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
