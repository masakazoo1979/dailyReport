import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Check,
  Clock,
  FileEdit,
  AlertCircle,
  X,
  Send,
  Building2,
} from 'lucide-react';

import { Badge } from './badge';

/**
 * Badge コンポーネントは、ステータスやカテゴリを視覚的に表示するための
 * 小さなラベル要素です。
 *
 * ## 特徴
 * - 4種類のバリアント（default, secondary, destructive, outline）
 * - アイコンとの組み合わせ対応
 * - コンパクトなサイズ
 *
 * ## 使用場面
 * - 日報ステータスの表示（下書き、提出済み、承認済み、差し戻し）
 * - カテゴリラベル
 * - タグ表示
 * - 通知バッジ
 */
const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ステータスやカテゴリを視覚的に表示するためのラベルコンポーネント。日報のステータス表示などに使用します。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'バッジのスタイルバリアント',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    asChild: {
      control: 'boolean',
      description: '子要素にスタイルを適用',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのバッジ。
 * 肯定的な状態（承認済み、完了など）に使用します。
 */
export const Default: Story = {
  args: {
    children: '承認済み',
  },
};

/**
 * セカンダリバッジ。
 * 中立的な状態（下書き、保留など）に使用します。
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '下書き',
  },
};

/**
 * 破壊的バッジ。
 * 否定的な状態（差し戻し、エラーなど）に使用します。
 */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '差し戻し',
  },
};

/**
 * アウトラインバッジ。
 * 控えめな表示が必要な場合に使用します。
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'タグ',
  },
};

/**
 * アイコン付きバッジ。
 * ステータスの意味を明確にするために使用します。
 */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Check className="size-3" />
        完了
      </>
    ),
  },
};

/**
 * 全バリアントの一覧表示。
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

/**
 * 日報ステータスバッジ。
 * 日報システムで使用するステータス表示の例です。
 */
export const ReportStatus: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <FileEdit className="size-3" />
        下書き
      </Badge>
      <Badge variant="default">
        <Send className="size-3" />
        提出済み
      </Badge>
      <Badge variant="default">
        <Check className="size-3" />
        承認済み
      </Badge>
      <Badge variant="destructive">
        <X className="size-3" />
        差し戻し
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報のステータスを表示するバッジの例',
      },
    },
  },
};

/**
 * 待機状態バッジ。
 * 処理中や保留中の状態を示します。
 */
export const Pending: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <Clock className="size-3" />
        承認待ち
      </>
    ),
  },
};

/**
 * 警告バッジ。
 * 注意が必要な状態を示します。
 */
export const Warning: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <AlertCircle className="size-3" />
        要対応
      </>
    ),
  },
};

/**
 * カテゴリタグとしての使用例。
 * 顧客の業種分類などに使用します。
 */
export const CategoryTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">
        <Building2 className="size-3" />
        製造業
      </Badge>
      <Badge variant="outline">
        <Building2 className="size-3" />
        IT・通信
      </Badge>
      <Badge variant="outline">
        <Building2 className="size-3" />
        金融・保険
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '顧客の業種分類を表示するタグの例',
      },
    },
  },
};

/**
 * テーブル内でのバッジ使用例。
 * 日報一覧テーブルのステータス列で使用します。
 */
export const InTable: Story = {
  render: () => (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left">日付</th>
          <th className="p-2 text-left">担当者</th>
          <th className="p-2 text-left">ステータス</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          <td className="p-2">2024/01/06</td>
          <td className="p-2">田中太郎</td>
          <td className="p-2">
            <Badge variant="default">
              <Check className="size-3" />
              承認済み
            </Badge>
          </td>
        </tr>
        <tr className="border-b">
          <td className="p-2">2024/01/05</td>
          <td className="p-2">山田花子</td>
          <td className="p-2">
            <Badge variant="destructive">
              <X className="size-3" />
              差し戻し
            </Badge>
          </td>
        </tr>
        <tr className="border-b">
          <td className="p-2">2024/01/04</td>
          <td className="p-2">佐藤一郎</td>
          <td className="p-2">
            <Badge variant="secondary">
              <FileEdit className="size-3" />
              下書き
            </Badge>
          </td>
        </tr>
      </tbody>
    </table>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報一覧テーブルでのステータス表示例',
      },
    },
  },
};
