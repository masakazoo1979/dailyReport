import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Mail, Plus, Trash2, Search, ChevronRight } from 'lucide-react';

import { Button } from './button';

/**
 * Button コンポーネントは、ユーザーのアクションをトリガーするための
 * インタラクティブな要素です。
 *
 * ## 特徴
 * - 6種類のバリアント（default, destructive, outline, secondary, ghost, link）
 * - 6種類のサイズ（default, sm, lg, icon, icon-sm, icon-lg）
 * - アクセシビリティ対応（フォーカス状態、無効状態の視覚的フィードバック）
 * - asChild プロパティによる柔軟なコンポジション
 *
 * ## 使用場面
 * - フォーム送信ボタン
 * - 新規作成・追加ボタン
 * - 削除・キャンセルボタン
 * - ナビゲーションリンク
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'shadcn/ui ベースの汎用ボタンコンポーネント。複数のバリアントとサイズをサポートします。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'ボタンのスタイルバリアント',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
      description: 'ボタンのサイズ',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    asChild: {
      control: 'boolean',
      description: '子要素にスタイルを適用',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 標準的なプライマリボタン。
 * 最も重要なアクション（送信、保存など）に使用します。
 */
export const Default: Story = {
  args: {
    children: '送信',
  },
};

/**
 * 削除や危険な操作を示すボタン。
 * 元に戻せないアクションに使用します。
 */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '削除',
  },
};

/**
 * 枠線のみのボタン。
 * セカンダリアクションやキャンセルに使用します。
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'キャンセル',
  },
};

/**
 * セカンダリスタイルのボタン。
 * 補助的なアクションに使用します。
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '下書き保存',
  },
};

/**
 * 背景なしのボタン。
 * ツールバーやリストアイテム内のアクションに使用します。
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: '詳細',
  },
};

/**
 * リンクスタイルのボタン。
 * インラインのナビゲーションリンクに使用します。
 */
export const Link: Story = {
  args: {
    variant: 'link',
    children: '詳細を見る',
  },
};

/**
 * 小サイズのボタン。
 * テーブル内やコンパクトなUIに使用します。
 */
export const Small: Story = {
  args: {
    size: 'sm',
    children: '編集',
  },
};

/**
 * 大サイズのボタン。
 * 目立たせたいアクションに使用します。
 */
export const Large: Story = {
  args: {
    size: 'lg',
    children: '日報を作成',
  },
};

/**
 * アイコンのみのボタン。
 * ツールバーやアクションボタンに使用します。
 */
export const IconOnly: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    children: <Search className="size-4" />,
  },
};

/**
 * アイコン付きボタン。
 * アクションの意味を明確にするために使用します。
 */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="size-4" />
        新規作成
      </>
    ),
  },
};

/**
 * 右側にアイコンを配置したボタン。
 * 「次へ」などのナビゲーションに使用します。
 */
export const WithTrailingIcon: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        続きを見る
        <ChevronRight className="size-4" />
      </>
    ),
  },
};

/**
 * 無効状態のボタン。
 * 条件が満たされていない場合などに使用します。
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: '送信',
  },
};

/**
 * 全バリアントの一覧表示。
 * デザインの統一性を確認する際に使用します。
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/**
 * 全サイズの一覧表示。
 */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Mail className="size-4" />
      </Button>
    </div>
  ),
};

/**
 * 日報システムでの使用例。
 * 実際のユースケースを示します。
 */
export const ReportActions: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">下書き保存</Button>
      <Button>提出</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報の編集画面で使用するアクションボタンの例',
      },
    },
  },
};

/**
 * 確認ダイアログのボタン配置例。
 */
export const DialogActions: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">キャンセル</Button>
      <Button variant="destructive">
        <Trash2 className="size-4" />
        削除する
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '削除確認ダイアログで使用するボタンの例',
      },
    },
  },
};
