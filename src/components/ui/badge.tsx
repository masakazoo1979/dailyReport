import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * バッジコンポーネントのスタイルバリアント定義
 *
 * @remarks
 * class-variance-authority (cva) を使用して、4種類のバリアントを管理
 *
 * @example
 * ```tsx
 * // ステータス表示
 * <Badge variant="default">承認済み</Badge>
 * <Badge variant="destructive">差し戻し</Badge>
 * ```
 */
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * バッジコンポーネント
 *
 * @description
 * ステータスやカテゴリを視覚的に表示するためのラベルコンポーネント。
 * 日報のステータス（下書き、提出済み、承認済み、差し戻し）の表示などに使用します。
 *
 * @param props - バッジのプロパティ
 * @param props.variant - バッジのスタイルバリアント
 *   - `default`: プライマリカラー（承認済み、完了など）
 *   - `secondary`: セカンダリカラー（下書き、保留など）
 *   - `destructive`: 赤色（差し戻し、エラーなど）
 *   - `outline`: 枠線のみ
 * @param props.asChild - true の場合、子要素にスタイルを適用
 * @param props.className - 追加のCSSクラス
 *
 * @example
 * 基本的な使用方法
 * ```tsx
 * <Badge>ラベル</Badge>
 * ```
 *
 * @example
 * 日報ステータスの表示
 * ```tsx
 * <Badge variant="secondary">下書き</Badge>
 * <Badge variant="default">提出済み</Badge>
 * <Badge variant="default">承認済み</Badge>
 * <Badge variant="destructive">差し戻し</Badge>
 * ```
 *
 * @example
 * アイコン付きバッジ
 * ```tsx
 * <Badge>
 *   <CheckIcon className="size-3" />
 *   完了
 * </Badge>
 * ```
 */
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
