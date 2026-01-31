import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

import { Alert, AlertTitle, AlertDescription } from './alert';

/**
 * Alert コンポーネントは、ユーザーに重要な情報やフィードバックを
 * 表示するための通知要素です。
 *
 * ## 特徴
 * - 2種類のバリアント（default, destructive）
 * - アイコンとの組み合わせ対応
 * - アクセシビリティ対応（role="alert"）
 *
 * ## 使用場面
 * - フォーム送信後の成功・失敗メッセージ
 * - システムエラーの通知
 * - 重要なお知らせ
 * - 入力バリデーションエラー
 */
const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ユーザーに重要な情報やフィードバックを表示するための通知コンポーネント。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'アラートのスタイルバリアント',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトのアラート。
 * 一般的な情報通知に使用します。
 */
export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>お知らせ</AlertTitle>
      <AlertDescription>
        システムメンテナンスを本日22:00より実施します。
      </AlertDescription>
    </Alert>
  ),
};

/**
 * 破壊的（エラー）アラート。
 * エラーや重要な警告に使用します。
 */
export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription>
        日報の保存に失敗しました。もう一度お試しください。
      </AlertDescription>
    </Alert>
  ),
};

/**
 * アイコン付きの情報アラート。
 */
export const WithInfoIcon: Story = {
  render: () => (
    <Alert>
      <Info className="size-4" />
      <AlertTitle>ヒント</AlertTitle>
      <AlertDescription>
        日報は毎日17:00までに提出してください。
      </AlertDescription>
    </Alert>
  ),
};

/**
 * アイコン付きのエラーアラート。
 */
export const WithErrorIcon: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription>
        入力内容にエラーがあります。確認してください。
      </AlertDescription>
    </Alert>
  ),
};

/**
 * 成功メッセージ。
 * カスタムスタイルで成功状態を表現します。
 */
export const Success: Story = {
  render: () => (
    <Alert className="border-green-500/50 text-green-700 [&>svg]:text-green-700">
      <CheckCircle2 className="size-4" />
      <AlertTitle>成功</AlertTitle>
      <AlertDescription>日報が正常に保存されました。</AlertDescription>
    </Alert>
  ),
};

/**
 * 警告メッセージ。
 * カスタムスタイルで警告状態を表現します。
 */
export const Warning: Story = {
  render: () => (
    <Alert className="border-yellow-500/50 text-yellow-700 [&>svg]:text-yellow-700">
      <AlertTriangle className="size-4" />
      <AlertTitle>注意</AlertTitle>
      <AlertDescription>
        入力内容が未保存です。ページを離れる前に保存してください。
      </AlertDescription>
    </Alert>
  ),
};

/**
 * タイトルのみのアラート。
 */
export const TitleOnly: Story = {
  render: () => (
    <Alert>
      <Info className="size-4" />
      <AlertTitle>新機能が追加されました</AlertTitle>
    </Alert>
  ),
};

/**
 * 日報提出成功メッセージ。
 * 実際のユースケースを示します。
 */
export const ReportSubmitted: Story = {
  render: () => (
    <Alert className="border-green-500/50 text-green-700 [&>svg]:text-green-700">
      <CheckCircle2 className="size-4" />
      <AlertTitle>日報を提出しました</AlertTitle>
      <AlertDescription>
        上長の承認をお待ちください。承認されるとメールでお知らせします。
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報提出後に表示する成功メッセージの例',
      },
    },
  },
};

/**
 * 日報差し戻し通知。
 */
export const ReportRejected: Story = {
  render: () => (
    <Alert variant="destructive">
      <XCircle className="size-4" />
      <AlertTitle>日報が差し戻されました</AlertTitle>
      <AlertDescription>
        上長からのコメントを確認し、修正後に再提出してください。
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報が差し戻された時に表示する通知の例',
      },
    },
  },
};

/**
 * バリデーションエラー。
 * フォーム入力エラーを表示します。
 */
export const ValidationError: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>入力エラー</AlertTitle>
      <AlertDescription>
        <ul className="list-inside list-disc">
          <li>日報日付は必須です</li>
          <li>訪問記録を1件以上入力してください</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'フォームバリデーションエラーを表示する例',
      },
    },
  },
};

/**
 * 認証エラー。
 * ログイン失敗時などに表示します。
 */
export const AuthError: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>ログインエラー</AlertTitle>
      <AlertDescription>
        メールアドレスまたはパスワードが正しくありません。
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ログイン画面でのエラー表示例',
      },
    },
  },
};

/**
 * システムメンテナンス通知。
 */
export const MaintenanceNotice: Story = {
  render: () => (
    <Alert>
      <AlertTriangle className="size-4" />
      <AlertTitle>メンテナンスのお知らせ</AlertTitle>
      <AlertDescription>
        2024年1月15日（月）22:00〜24:00の間、システムメンテナンスを実施します。
        この間、システムをご利用いただけません。
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'システムメンテナンスの事前通知例',
      },
    },
  },
};
