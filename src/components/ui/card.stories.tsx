import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Calendar,
  User,
  Building2,
  FileText,
  MoreVertical,
  MapPin,
  Clock,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';
import { Button } from './button';
import { Badge } from './badge';

/**
 * Card コンポーネントは、関連するコンテンツをグループ化して表示するための
 * コンテナ要素です。
 *
 * ## 特徴
 * - セマンティックな構造（Header、Content、Footer）
 * - 柔軟なレイアウト
 * - 影とボーダーによる視覚的な区切り
 *
 * ## 使用場面
 * - 日報詳細表示
 * - 顧客情報カード
 * - ダッシュボードウィジェット
 * - フォームコンテナ
 */
const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'コンテンツをグループ化して表示するためのコンテナコンポーネント。日報詳細、顧客情報などに使用します。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本的なカード構造。
 * ヘッダー、コンテンツ、フッターを含む標準的な構成です。
 */
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>カードタイトル</CardTitle>
        <CardDescription>
          カードの説明テキストをここに配置します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>カードのメインコンテンツをここに配置します。</p>
      </CardContent>
      <CardFooter>
        <Button>アクション</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * ヘッダーにアクションボタンを配置したカード。
 */
export const WithHeaderAction: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>日報詳細</CardTitle>
        <CardDescription>2024年1月6日（月）</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>日報の詳細内容がここに表示されます。</p>
      </CardContent>
    </Card>
  ),
};

/**
 * シンプルなカード（フッターなし）。
 */
export const Simple: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>お知らせ</CardTitle>
      </CardHeader>
      <CardContent>
        <p>システムメンテナンスのお知らせです。</p>
      </CardContent>
    </Card>
  ),
};

/**
 * コンテンツのみのカード。
 */
export const ContentOnly: Story = {
  render: () => (
    <Card>
      <CardContent className="pt-6">
        <p>シンプルなコンテンツのみのカードです。</p>
      </CardContent>
    </Card>
  ),
};

/**
 * 日報詳細カード。
 * 実際のユースケースを示します。
 */
export const ReportDetail: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <CardTitle>日報詳細</CardTitle>
        </div>
        <CardDescription>
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            2024年1月6日（月）
          </span>
        </CardDescription>
        <CardAction>
          <Badge variant="default">承認済み</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">担当者</h4>
          <p className="flex items-center gap-1">
            <User className="size-4" />
            田中太郎
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            本日の活動内容
          </h4>
          <p>
            株式会社ABC様を訪問し、新製品のプレゼンテーションを実施しました。
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            明日の予定
          </h4>
          <p>見積書の作成と提案資料の修正を行います。</p>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">編集</Button>
        <Button>コメント</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報詳細画面で使用するカードの例',
      },
    },
  },
};

/**
 * 顧客情報カード。
 */
export const CustomerCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <CardTitle>株式会社ABC</CardTitle>
        </div>
        <CardDescription>IT・通信</CardDescription>
        <CardAction>
          <Badge variant="outline">アクティブ</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2">
          <User className="mt-1 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">担当者</p>
            <p>鈴木部長</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-1 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">住所</p>
            <p>東京都渋谷区xxx-xxx</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          詳細を見る
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: '顧客マスタで使用するカードの例',
      },
    },
  },
};

/**
 * 訪問記録カード。
 */
export const VisitRecord: Story = {
  render: () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">訪問記録</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Clock className="size-3" />
          10:00 - 11:30
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          <span>株式会社ABC</span>
        </div>
        <p className="text-sm text-muted-foreground">
          新製品のプレゼンテーションを実施。担当者から前向きな反応をいただきました。
        </p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: '日報内の訪問記録を表示するカードの例',
      },
    },
  },
};

/**
 * ダッシュボード統計カード。
 */
export const StatCard: Story = {
  render: () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          今月の訪問数
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">24</div>
        <p className="text-sm text-muted-foreground">先月比 +12%</p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ダッシュボードで使用する統計カードの例',
      },
    },
  },
};

/**
 * 複数カードのグリッドレイアウト。
 */
export const CardGrid: Story = {
  render: () => (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            承認待ち
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            今月の日報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18</div>
        </CardContent>
      </Card>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'ダッシュボードでの複数カード表示例',
      },
    },
  },
};
