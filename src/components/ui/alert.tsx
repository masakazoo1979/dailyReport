import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * アラートコンポーネントのスタイルバリアント定義
 *
 * @remarks
 * class-variance-authority (cva) を使用して、default と destructive の2種類のバリアントを管理
 */
const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * アラートコンポーネント
 *
 * @description
 * ユーザーに重要な情報やフィードバックを表示するためのコンポーネント。
 * 成功メッセージ、エラー、警告などの通知に使用します。
 *
 * @param props - アラートのプロパティ
 * @param props.variant - アラートのスタイルバリアント
 *   - `default`: 通常の情報表示
 *   - `destructive`: エラーや警告の表示
 * @param props.className - 追加のCSSクラス
 *
 * @example
 * 基本的な使用方法
 * ```tsx
 * <Alert>
 *   <AlertTitle>お知らせ</AlertTitle>
 *   <AlertDescription>システムメンテナンスを予定しています。</AlertDescription>
 * </Alert>
 * ```
 *
 * @example
 * エラー表示
 * ```tsx
 * <Alert variant="destructive">
 *   <AlertCircle className="size-4" />
 *   <AlertTitle>エラー</AlertTitle>
 *   <AlertDescription>保存に失敗しました。</AlertDescription>
 * </Alert>
 * ```
 */
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * アラートタイトルコンポーネント
 *
 * @description
 * アラートの主題を表示するためのタイトル要素。
 */
function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className
      )}
      {...props}
    />
  );
}

/**
 * アラート説明コンポーネント
 *
 * @description
 * アラートの詳細な説明を表示するための要素。
 */
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
