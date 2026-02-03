import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * カードコンポーネント
 *
 * @description
 * コンテンツをグループ化して表示するためのコンテナコンポーネント。
 * CardHeader、CardContent、CardFooter などの子コンポーネントと組み合わせて使用します。
 * 日報詳細、顧客情報、ダッシュボードのウィジェットなどに使用します。
 *
 * @param props - カードのプロパティ
 * @param props.className - 追加のCSSクラス
 *
 * @example
 * 基本的な使用方法
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>日報詳細</CardTitle>
 *     <CardDescription>2024年1月6日の日報</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     コンテンツをここに配置
 *   </CardContent>
 *   <CardFooter>
 *     <Button>保存</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

/**
 * カードヘッダーコンポーネント
 *
 * @description
 * カードのタイトルや説明を配置するためのヘッダー領域。
 * CardTitle、CardDescription、CardAction と組み合わせて使用します。
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

/**
 * カードタイトルコンポーネント
 *
 * @description
 * カードの主題を表示するためのタイトル要素。
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

/**
 * カード説明コンポーネント
 *
 * @description
 * カードの補足説明を表示するための要素。
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

/**
 * カードアクションコンポーネント
 *
 * @description
 * カードヘッダー内にアクションボタンを配置するための要素。
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

/**
 * カードコンテンツコンポーネント
 *
 * @description
 * カードの主要なコンテンツを配置するための領域。
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  );
}

/**
 * カードフッターコンポーネント
 *
 * @description
 * カードの下部にアクションボタンなどを配置するための領域。
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
