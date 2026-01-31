import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Search, Mail, Lock, Calendar, JapaneseYen } from 'lucide-react';

import { Input } from './input';
import { Label } from './label';

/**
 * Input コンポーネントは、ユーザーからテキスト入力を受け付けるための
 * 基本的なフォーム要素です。
 *
 * ## 特徴
 * - 様々な入力タイプに対応（text, email, password, number, date など）
 * - アクセシビリティ対応（フォーカス状態、エラー状態の視覚的フィードバック）
 * - ファイル入力のスタイリング対応
 * - Tailwind CSS によるカスタマイズ性
 *
 * ## 使用場面
 * - ログインフォーム
 * - 検索ボックス
 * - 日報・顧客情報の入力
 * - 日付・金額の入力
 */
const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'shadcn/ui ベースの入力フィールドコンポーネント。様々な入力タイプとバリデーション状態をサポートします。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'text',
        'email',
        'password',
        'number',
        'date',
        'time',
        'file',
        'search',
      ],
      description: '入力タイプ',
      table: {
        defaultValue: { summary: 'text' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 標準的なテキスト入力フィールド。
 */
export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'テキストを入力',
  },
};

/**
 * メールアドレス入力フィールド。
 * 適切な入力タイプを使用することで、モバイルでのキーボード最適化が行われます。
 */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'example@example.com',
  },
};

/**
 * パスワード入力フィールド。
 * 入力内容はマスクされます。
 */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'パスワード',
  },
};

/**
 * 数値入力フィールド。
 * スピンボタンが表示されます。
 */
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

/**
 * 日付入力フィールド。
 * ブラウザネイティブの日付ピッカーが表示されます。
 */
export const Date: Story = {
  args: {
    type: 'date',
  },
};

/**
 * 時刻入力フィールド。
 */
export const Time: Story = {
  args: {
    type: 'time',
  },
};

/**
 * ファイル入力フィールド。
 * カスタムスタイルが適用されます。
 */
export const File: Story = {
  args: {
    type: 'file',
  },
};

/**
 * 無効状態の入力フィールド。
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '入力できません',
  },
};

/**
 * エラー状態の入力フィールド。
 * aria-invalid 属性を使用してエラー状態を示します。
 */
export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: '不正な値',
  },
};

/**
 * ラベル付きの入力フィールド。
 * アクセシビリティのため、Label コンポーネントと組み合わせて使用します。
 */
export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="email">メールアドレス</Label>
      <Input type="email" id="email" placeholder="example@example.com" />
    </div>
  ),
};

/**
 * エラーメッセージ付きの入力フィールド。
 * フォームバリデーションエラーを表示する例です。
 */
export const WithError: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="email-error">メールアドレス</Label>
      <Input
        type="email"
        id="email-error"
        aria-invalid="true"
        defaultValue="invalid-email"
      />
      <p className="text-sm text-destructive">
        有効なメールアドレスを入力してください
      </p>
    </div>
  ),
};

/**
 * アイコン付きの入力フィールド（左側）。
 * 検索ボックスなどで使用します。
 */
export const WithLeftIcon: Story = {
  render: () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder="検索..." className="pl-9" />
    </div>
  ),
};

/**
 * アイコン付きの入力フィールド（右側）。
 */
export const WithRightIcon: Story = {
  render: () => (
    <div className="relative">
      <Input type="text" placeholder="金額を入力" className="pr-9" />
      <JapaneseYen className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  ),
};

/**
 * ログインフォームの例。
 * 実際のユースケースを示します。
 */
export const LoginForm: Story = {
  render: () => (
    <div className="grid w-full gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="login-email">
          <Mail className="mr-1 inline size-4" />
          メールアドレス
        </Label>
        <Input
          type="email"
          id="login-email"
          placeholder="example@example.com"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="login-password">
          <Lock className="mr-1 inline size-4" />
          パスワード
        </Label>
        <Input type="password" id="login-password" placeholder="パスワード" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ログイン画面で使用するフォームの例',
      },
    },
  },
};

/**
 * 日報入力フォームの例。
 */
export const ReportForm: Story = {
  render: () => (
    <div className="grid w-full gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="report-date">
          <Calendar className="mr-1 inline size-4" />
          日報日付
        </Label>
        <Input type="date" id="report-date" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="visit-time">訪問時刻</Label>
        <Input type="time" id="visit-time" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報登録画面で使用するフォームの例',
      },
    },
  },
};
