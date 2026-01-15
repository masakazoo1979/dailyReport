'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { visitSchema, type VisitInput } from '@/lib/validations/report';

interface Customer {
  customerId: number;
  customerName: string;
  companyName: string;
}

interface VisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (visit: VisitInput) => void;
  customers: Customer[];
  initialData?: VisitInput | null;
  mode: 'create' | 'edit';
}

/**
 * 訪問記録モーダルコンポーネント
 *
 * 訪問時刻、顧客、訪問内容を入力するモーダル
 */
export function VisitModal({
  open,
  onOpenChange,
  onSave,
  customers,
  initialData,
  mode,
}: VisitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VisitInput>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visitTime: initialData?.visitTime || '',
      customerId: initialData?.customerId || undefined,
      visitContent: initialData?.visitContent || '',
    },
  });

  // 初期データが変わったらフォームをリセット
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else if (open) {
      form.reset({
        visitTime: '',
        customerId: undefined,
        visitContent: '',
      });
    }
  }, [initialData, open, form]);

  const handleSubmit = async (data: VisitInput) => {
    try {
      setIsSubmitting(true);
      onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save visit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '訪問記録を追加' : '訪問記録を編集'}
          </DialogTitle>
          <DialogDescription>
            訪問時刻、訪問先顧客、訪問内容を入力してください。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* 訪問時刻 */}
            <FormField
              control={form.control}
              name="visitTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    訪問時刻 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="14:30"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 顧客選択 */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    訪問先顧客 <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="顧客を選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem
                          key={customer.customerId}
                          value={customer.customerId.toString()}
                        >
                          {customer.companyName} - {customer.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 訪問内容 */}
            <FormField
              control={form.control}
              name="visitContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    訪問内容 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="訪問内容を入力してください"
                      className="min-h-[120px] resize-none"
                      maxLength={1000}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <FormMessage />
                    <span>{field.value?.length || 0} / 1000</span>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
