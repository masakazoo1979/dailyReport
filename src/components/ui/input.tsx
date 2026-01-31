import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * 入力フィールドコンポーネント
 *
 * @description
 * shadcn/ui ベースの入力フィールドコンポーネント。
 * テキスト、メール、パスワード、数値など様々なタイプの入力をサポートします。
 * アクセシビリティに配慮したフォーカス状態とエラー状態の表示を提供します。
 *
 * @param props - 入力フィールドのプロパティ
 * @param props.type - 入力タイプ（text, email, password, number など）
 * @param props.className - 追加のCSSクラス
 * @param props.placeholder - プレースホルダーテキスト
 * @param props.disabled - 無効状態
 * @param props.aria-invalid - エラー状態を示すアクセシビリティ属性
 *
 * @example
 * 基本的な使用方法
 * ```tsx
 * <Input type="text" placeholder="名前を入力" />
 * ```
 *
 * @example
 * パスワード入力
 * ```tsx
 * <Input type="password" placeholder="パスワード" />
 * ```
 *
 * @example
 * エラー状態
 * ```tsx
 * <Input type="email" aria-invalid="true" />
 * ```
 *
 * @example
 * React Hook Form との連携
 * ```tsx
 * <Input {...register('email')} />
 * ```
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export { Input };
