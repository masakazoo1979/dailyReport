import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * ボタンコンポーネントのスタイルバリアント定義
 *
 * @remarks
 * class-variance-authority (cva) を使用して、variant と size の組み合わせを管理
 *
 * @example
 * ```tsx
 * // デフォルトスタイル
 * <Button>送信</Button>
 *
 * // バリアント指定
 * <Button variant="destructive" size="lg">削除</Button>
 * ```
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * 汎用ボタンコンポーネント
 *
 * @description
 * shadcn/ui ベースのボタンコンポーネント。
 * 複数のスタイルバリアントとサイズをサポートし、
 * アクセシビリティに配慮した実装を提供します。
 *
 * @param props - ボタンのプロパティ
 * @param props.variant - ボタンのスタイルバリアント
 *   - `default`: プライマリカラーの塗りつぶしボタン
 *   - `destructive`: 削除・危険な操作用の赤いボタン
 *   - `outline`: 枠線のみのボタン
 *   - `secondary`: セカンダリカラーのボタン
 *   - `ghost`: 背景なしのボタン（ホバー時に表示）
 *   - `link`: リンクスタイルのボタン
 * @param props.size - ボタンのサイズ
 *   - `default`: 標準サイズ (h-9)
 *   - `sm`: 小サイズ (h-8)
 *   - `lg`: 大サイズ (h-10)
 *   - `icon`: アイコン専用 (9x9)
 *   - `icon-sm`: 小アイコン (8x8)
 *   - `icon-lg`: 大アイコン (10x10)
 * @param props.asChild - true の場合、子要素にスタイルを適用
 * @param props.className - 追加のCSSクラス
 *
 * @example
 * 基本的な使用方法
 * ```tsx
 * <Button>クリック</Button>
 * ```
 *
 * @example
 * バリアントとサイズの指定
 * ```tsx
 * <Button variant="outline" size="lg">大きな枠線ボタン</Button>
 * ```
 *
 * @example
 * アイコンボタン
 * ```tsx
 * <Button variant="ghost" size="icon">
 *   <SearchIcon />
 * </Button>
 * ```
 *
 * @example
 * リンクとして使用（asChild）
 * ```tsx
 * <Button asChild>
 *   <Link href="/reports">日報一覧へ</Link>
 * </Button>
 * ```
 */
function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
