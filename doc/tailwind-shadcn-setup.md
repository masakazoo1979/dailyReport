# Tailwind CSS と shadcn/ui セットアップ完了

このドキュメントは、営業日報システムにおけるTailwind CSSとshadcn/uiのセットアップ内容を記録したものです。

## セットアップ完了日

2025-01-09

## インストールされたパッケージ

### Core Dependencies

```json
{
  "tailwindcss": "latest",
  "postcss": "latest",
  "autoprefixer": "latest",
  "tailwindcss-animate": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "lucide-react": "latest"
}
```

### shadcn/ui Components

以下のコンポーネントが `src/components/ui/` にインストールされています：

1. **Button** (`button.tsx`) - ボタンコンポーネント
2. **Input** (`input.tsx`) - 入力フィールド
3. **Card** (`card.tsx`) - カードコンポーネント
4. **Table** (`table.tsx`) - テーブルコンポーネント
5. **Dialog** (`dialog.tsx`) - ダイアログ/モーダル
6. **Form** (`form.tsx`) - フォームコンポーネント
7. **Select** (`select.tsx`) - セレクトドロップダウン
8. **Textarea** (`textarea.tsx`) - テキストエリア
9. **Badge** (`badge.tsx`) - バッジ/ラベル
10. **Alert** (`alert.tsx`) - アラート/通知
11. **Label** (`label.tsx`) - ラベル（フォーム依存で自動インストール）

## 設定ファイル

### 1. tailwind.config.ts

Tailwind CSSの設定ファイル。以下の機能を含む：

- **ダークモード**: `class`ベースのダークモード対応
- **カラーテーマ**: CSS変数を使用したカラーシステム
- **カスタムカラー**:
  - `status.draft` - 下書きステータス用
  - `status.submitted` - 提出済みステータス用
  - `status.approved` - 承認済みステータス用
  - `status.rejected` - 差し戻しステータス用
- **アニメーション**: アコーディオンアニメーション
- **プラグイン**: `tailwindcss-animate`

### 2. postcss.config.mjs

PostCSSの設定ファイル。以下のプラグインを含む：

- `tailwindcss` - Tailwind CSSの処理
- `autoprefixer` - ベンダープレフィックスの自動付与

### 3. components.json

shadcn/uiの設定ファイル。以下を定義：

- **style**: default
- **rsc**: true (React Server Components対応)
- **tsx**: true (TypeScript対応)
- **baseColor**: slate
- **cssVariables**: true (CSS変数使用)
- **aliases**:
  - `@/components` → `src/components`
  - `@/utils` → `src/lib/utils`

### 4. src/app/globals.css

グローバルスタイルファイル。以下を含む：

- Tailwind CSSのベースレイヤー
- ライト/ダークモードのカラーテーマ定義
- カスタムユーティリティクラス：
  - `.status-draft` - 下書きステータス
  - `.status-submitted` - 提出済みステータス
  - `.status-approved` - 承認済みステータス
  - `.status-rejected` - 差し戻しステータス
  - `.role-badge-sales` - 一般営業ロールバッジ
  - `.role-badge-manager` - 上長ロールバッジ

### 5. src/lib/utils.ts

ユーティリティ関数。以下を含む：

- `cn()` - クラス名をマージするヘルパー関数（clsx + tailwind-merge）
- `formatDate()` - 日付フォーマット関数（既存）

### 6. src/app/layout.tsx

ルートレイアウトファイル。`globals.css`をインポート。

## カラーテーマ

### ライトモード

| カラー      | HSL値             | 用途                                 |
| ----------- | ----------------- | ------------------------------------ |
| primary     | 221.2 83.2% 53.3% | プライマリカラー（ボタン、リンク等） |
| secondary   | 210 40% 96.1%     | セカンダリカラー                     |
| background  | 0 0% 100%         | 背景色                               |
| foreground  | 222.2 84% 4.9%    | テキスト色                           |
| destructive | 0 84.2% 60.2%     | 危険な操作（削除等）                 |

### ダークモード

ダークモードは `.dark` クラスを html 要素に追加することで有効化されます。

## 使用方法

### 基本的なコンポーネントの使用例

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイトル</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="入力してください" />
        <Button>送信</Button>
      </CardContent>
    </Card>
  );
}
```

### ステータスバッジの使用例

```tsx
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  return (
    <>
      <Badge className="status-draft">下書き</Badge>
      <Badge className="status-submitted">提出済み</Badge>
      <Badge className="status-approved">承認済み</Badge>
      <Badge className="status-rejected">差し戻し</Badge>
    </>
  );
}
```

### Tailwind CSSユーティリティクラスの使用例

```tsx
export function Example() {
  return (
    <div className="p-4 bg-background">
      <h1 className="text-2xl font-bold text-primary">見出し</h1>
      <p className="text-muted-foreground">説明文</p>
    </div>
  );
}
```

## テストページ

セットアップの動作確認用に `src/components/test-setup.tsx` を作成しました。
このコンポーネントは以下の要素を含みます：

- 各種ボタンバリアント
- カードコンポーネント
- 入力フィールド
- ステータスバッジ
- アラート

ホームページ（`src/app/page.tsx`）で現在表示されています。
実装完了後、このテストコンポーネントは削除可能です。

## 次のステップ

1. **認証画面の実装** - ログイン/ログアウト画面
2. **日報画面の実装** - 日報一覧、登録、編集、詳細画面
3. **マスタ管理画面の実装** - 顧客、営業担当者マスタ
4. **ダッシュボードの実装** - 統計情報の表示

## アクセシビリティ

shadcn/uiのコンポーネントは以下のアクセシビリティ機能を含みます：

- キーボードナビゲーション対応
- ARIA属性の適切な設定
- フォーカス管理
- スクリーンリーダー対応

## パフォーマンス

- Tailwind CSSはプロダクションビルド時に未使用のスタイルを自動的に削除（PurgeCSS）
- コンポーネントはReact Server Componentsとして使用可能
- 必要に応じてクライアントコンポーネントとしても使用可能

## トラブルシューティング

### スタイルが適用されない場合

1. `globals.css` が `layout.tsx` でインポートされているか確認
2. Tailwind CSSの設定ファイル（`tailwind.config.ts`）のcontent配列にファイルパスが含まれているか確認
3. 開発サーバーを再起動

### TypeScriptエラーが出る場合

1. `tsconfig.json` のpaths設定を確認
2. `npm install` を実行して依存関係を再インストール
3. エディタのTypeScriptサーバーを再起動

## 参考リンク

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Next.js 14 Documentation](https://nextjs.org/docs)

---

Generated: 2025-01-09
