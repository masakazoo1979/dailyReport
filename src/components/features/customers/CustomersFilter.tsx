'use client';

/**
 * Customers Filter Component
 *
 * Based on doc/screen-specification.md S-006 顧客マスタ一覧画面
 *
 * 検索条件:
 * - C-001: 会社名（検索） - 部分一致検索
 * - C-002: 業種（検索） - セレクトボックス、初期値: すべて
 * - C-003: 検索ボタン
 * - C-004: クリアボタン
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
import { Search, X } from 'lucide-react';
import { INDUSTRIES, type CustomersFilter } from '@/lib/validations/customers';
import { z } from 'zod';

// Form-specific schema that allows empty strings
const formSchema = z.object({
  company_name: z.string().optional(),
  industry: z.enum([...INDUSTRIES, 'すべて'] as const).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomersFilterProps {
  /**
   * Default filter values
   */
  defaultValues?: Partial<CustomersFilter>;
}

export function CustomersFilter({ defaultValues }: CustomersFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: searchParams.get('company_name') || '',
      industry:
        (searchParams.get('industry') as FormValues['industry']) || 'すべて',
      ...defaultValues,
    },
  });

  /**
   * Handle form submission (C-003: 検索ボタン)
   */
  const onSubmit = (data: FormValues) => {
    const params = new URLSearchParams();

    // Add filter parameters
    if (data.company_name && data.company_name.trim()) {
      params.set('company_name', data.company_name.trim());
    }
    if (data.industry && data.industry !== 'すべて') {
      params.set('industry', data.industry);
    }

    // Reset to page 1 when filtering
    params.set('page', '1');

    // Navigate with new filters
    router.push(`/dashboard/customers?${params.toString()}`);
  };

  /**
   * Handle clear button (C-004: クリアボタン)
   */
  const handleClear = () => {
    reset({
      company_name: '',
      industry: 'すべて',
    });

    // Navigate to page without filters
    router.push('/dashboard/customers');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">顧客検索</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* C-001: 会社名（検索） */}
            <div className="space-y-2">
              <Label htmlFor="company_name">会社名</Label>
              <Input
                id="company_name"
                type="text"
                placeholder="会社名で検索"
                maxLength={255}
                aria-invalid={errors.company_name ? 'true' : 'false'}
                aria-describedby={
                  errors.company_name ? 'company_name-error' : undefined
                }
                {...register('company_name')}
              />
              {errors.company_name && (
                <p
                  id="company_name-error"
                  className="text-sm font-medium text-destructive"
                  role="alert"
                >
                  {errors.company_name.message}
                </p>
              )}
            </div>

            {/* C-002: 業種（検索） */}
            <div className="space-y-2">
              <Label htmlFor="industry">業種</Label>
              <Select
                value={watch('industry') || 'すべて'}
                onValueChange={(value) => {
                  setValue('industry', value as FormValues['industry'], {
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="すべて">すべて</SelectItem>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* C-003: 検索ボタン, C-004: クリアボタン */}
          <div className="flex gap-2">
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              検索
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" />
              クリア
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
