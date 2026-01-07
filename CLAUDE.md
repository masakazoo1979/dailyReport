# 営業日報システム

営業担当者が日々の営業活動を記録・報告し、上長が承認・コメントできるWebアプリケーションシステムです。

## 目次

- [システム概要](#システム概要)
- [技術スタック](#技術スタック)
- [ドキュメント一覧](#ドキュメント一覧)
- [プロジェクト構成](#プロジェクト構成)
- [セットアップ](#セットアップ)
- [開発](#開発)
- [テスト](#テスト)
- [デプロイ](#デプロイ)
- [貢献](#貢献)

---

## システム概要

### 主要機能

#### 1. 日報管理
- **日報登録・編集**: 営業担当者が日々の活動を記録
- **ステータス管理**: 下書き → 提出済み → 承認済み/差し戻し
- **承認フロー**: 上長による承認・差し戻し機能
- **課題・相談**: 業務上の課題や相談事項を記録
- **明日の予定**: 翌日の活動予定を記録

#### 2. 訪問記録管理
- **複数訪問記録**: 1日に複数の訪問記録を登録可能
- **訪問詳細**: 訪問時刻、訪問先顧客、訪問内容を記録
- **顧客紐付け**: 顧客マスタと連携

#### 3. コメント機能
- **フィードバック**: 上長や同僚がコメントを投稿
- **双方向コミュニケーション**: 日報に対する質問や助言

#### 4. マスタ管理
- **顧客マスタ**: 訪問先顧客の情報管理（会社名、担当者、業種等）
- **営業マスタ**: 営業担当者の情報管理（上長のみアクセス可）

#### 5. 権限管理
- **一般営業**: 自分の日報の作成・編集・閲覧
- **上長**: 配下メンバーの日報閲覧・承認・差し戻し、営業マスタ管理

### ステータス遷移

```
下書き → 提出済み → 承認済み
              ↓
          差し戻し → 提出済み（再提出）
```

---

## 技術スタック

### フロントエンド
- **言語**: TypeScript
- **フレームワーク**: Next.js 14 (App Router)
- **UIコンポーネント**: shadcn/ui + Tailwind CSS
- **状態管理**: React Server Components + Server Actions
- **フォーム管理**: React Hook Form
- **バリデーション**: Zod

### バックエンド
- **ランタイム**: Node.js
- **API**: Next.js API Routes / Server Actions
- **APIスキーマ定義**: OpenAPI (Zodによる検証)
- **認証**: NextAuth.js (セッションベース)

### データベース
- **DBMS**: PostgreSQL 16
- **ORM**: Prisma
- **マイグレーション**: Prisma Migrate
- **スキーマ定義**: Prisma Schema

### テスト
- **テストフレームワーク**: Vitest
- **E2Eテスト**: Playwright (推奨)
- **APIテスト**: Vitest + MSW (Mock Service Worker)

### インフラ・デプロイ
- **コンテナ**: Docker
- **クラウド**: Google Cloud Platform
- **デプロイ先**: Google Cloud Run
- **CI/CD**: GitHub Actions
- **データベースホスティング**: Cloud SQL for PostgreSQL

### 開発ツール
- **パッケージマネージャー**: npm / yarn / pnpm
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **型チェック**: TypeScript
- **Git**: GitHub

---

## ドキュメント一覧

プロジェクトには以下のドキュメントが含まれています：

### 設計ドキュメント

| ドキュメント | ファイル名 | 説明 |
|------------|-----------|------|
| ER図 | [ER-diagram.md](./doc/ER-diagram.md) | データベース設計のER図（Mermaid形式） |
| 画面定義書 | [screen-specification.md](./doc/screen-specification.md) | 全9画面の詳細仕様、レイアウト、バリデーション |
| 画面遷移図 | [screen-transition.md](./doc/screen-transition.md) | 画面間の遷移フロー（Mermaid形式） |
| API仕様書 | [api-specification.md](./doc/api-specification.md) | RESTful APIの詳細仕様 |
| テスト仕様書 | [test-specification.md](./doc/test-specification.md) | 203件のテストケース定義 |

### 開発ドキュメント

| ドキュメント | ファイル名 | 説明 |
|------------|-----------|------|
| データベースセットアップ | [database-setup.md](./doc/database-setup.md) | Prisma・PostgreSQLのセットアップガイド |
| Prismaスキーマ | [prisma/schema.prisma](./prisma/schema.prisma) | データベーススキーマ定義 |

### 設計ドキュメントの概要

#### ER図 (ER-diagram.md)
- 5つのテーブル定義: Sales, Customer, DailyReport, Visit, Comment
- リレーションシップの明確化
- データ型とカラム定義

#### 画面定義書 (screen-specification.md)
- 9画面の詳細仕様
  - ログイン画面
  - ダッシュボード
  - 日報一覧・登録・編集・詳細画面
  - 顧客マスタ一覧・登録画面
  - 営業マスタ一覧・登録画面
- 画面レイアウト（ワイヤーフレーム）
- 画面項目一覧
- バリデーション仕様
- エラーメッセージ一覧
- 権限制御
- 非機能要件

#### 画面遷移図 (screen-transition.md)
- 全体画面遷移図
- 役割別画面遷移（一般営業・上長）
- 日報ワークフロー図
- 画面遷移詳細仕様
- データ受け渡し仕様

#### API仕様書 (api-specification.md)
- 6つのリソースグループ
  - 認証API (4エンドポイント)
  - 日報API (8エンドポイント)
  - 訪問記録API (4エンドポイント)
  - コメントAPI (3エンドポイント)
  - 顧客API (5エンドポイント)
  - 営業担当者API (5エンドポイント)
- リクエスト・レスポンス形式
- バリデーション仕様
- エラーコード一覧
- 認証・セキュリティ仕様

#### テスト仕様書 (test-specification.md)
- 合計203件のテストケース
- テストレベル: 単体/結合/システム/受け入れ
- テストタイプ: 機能/UI/API/権限/バリデーション/セキュリティ/パフォーマンス/互換性
- テストデータ定義
- 不具合管理フロー
- テスト実施計画

---

## プロジェクト構成

```
dailyReport/
├── .env.example              # 環境変数のサンプル
├── .gitignore               # Git除外ファイル
├── CLAUDE.md                # プロジェクト総合ドキュメント（本ファイル）
│
├── doc/                     # ドキュメントフォルダ
│   ├── ER-diagram.md        # データベースER図
│   ├── screen-specification.md  # 画面定義書
│   ├── screen-transition.md     # 画面遷移図
│   ├── api-specification.md     # API仕様書
│   ├── test-specification.md    # テスト仕様書
│   └── database-setup.md        # データベースセットアップガイド
│
├── prisma/
│   ├── schema.prisma        # Prismaスキーマ定義
│   ├── migrations/          # マイグレーションファイル
│   └── seed.ts              # シードデータ
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # 認証関連ページ
│   │   ├── (dashboard)/    # ダッシュボード・メイン機能
│   │   ├── api/            # API Routes
│   │   └── layout.tsx      # ルートレイアウト
│   │
│   ├── components/          # UIコンポーネント
│   │   ├── ui/             # shadcn/uiコンポーネント
│   │   └── features/       # 機能別コンポーネント
│   │
│   ├── lib/                # ユーティリティ・ライブラリ
│   │   ├── prisma.ts       # Prismaクライアント
│   │   ├── auth.ts         # 認証設定
│   │   └── validations/    # Zodバリデーションスキーマ
│   │
│   └── types/              # TypeScript型定義
│
├── tests/                   # テストファイル
│   ├── unit/               # 単体テスト
│   ├── integration/        # 結合テスト
│   └── e2e/                # E2Eテスト
│
├── public/                  # 静的ファイル
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── vitest.config.ts
```

---

## セットアップ

### 前提条件

- Node.js 18以上
- PostgreSQL 16以上（またはDocker）
- npm / yarn / pnpm

### 1. リポジトリのクローン

```bash
git clone https://github.com/masakazoo1979/dailyReport.git
cd dailyReport
```

### 2. 依存パッケージのインストール

```bash
npm install
# または
yarn install
# または
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daily_report?schema=public"

# Application
NODE_ENV="development"
PORT=3000

# Session
SESSION_SECRET="your-secret-key-here-change-in-production"
```

### 4. データベースのセットアップ

#### Dockerを使用する場合（推奨）

```bash
# PostgreSQLコンテナを起動
docker run --name daily-report-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=daily_report \
  -p 5432:5432 \
  -d postgres:16
```

#### ローカルのPostgreSQLを使用する場合

```bash
# データベースを作成
createdb daily_report
```

詳細は [database-setup.md](./doc/database-setup.md) を参照してください。

### 5. Prismaのセットアップ

```bash
# Prismaクライアントを生成
npx prisma generate

# マイグレーションを実行
npx prisma migrate dev --name init

# シードデータを投入（オプション）
npx prisma db seed
```

### 6. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

ブラウザで http://localhost:3000 を開きます。

---

## 開発

### 開発サーバー

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### 本番環境で実行

```bash
npm run start
```

### リンター・フォーマッター

```bash
# ESLintでコードチェック
npm run lint

# Prettierでフォーマット
npm run format

# 型チェック
npm run type-check
```

### データベース管理

```bash
# Prisma Studioを起動（GUIでデータ確認・編集）
npx prisma studio

# マイグレーション作成
npx prisma migrate dev --name <migration-name>

# マイグレーションをリセット
npx prisma migrate reset

# スキーマからデータベースを更新
npx prisma db push
```

---

## テスト

### テストの実行

```bash
# すべてのテストを実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage

# E2Eテスト
npm run test:e2e
```

### テストの種類

#### 単体テスト (Unit Tests)
- コンポーネント、関数、ユーティリティのテスト
- Vitestを使用

#### 結合テスト (Integration Tests)
- API、データベース連携のテスト
- Vitest + Prismaを使用

#### E2Eテスト (End-to-End Tests)
- ユーザーシナリオのテスト
- Playwrightを使用

詳細なテストケースは [test-specification.md](./doc/test-specification.md) を参照してください。

---

## デプロイ

### Google Cloud Runへのデプロイ

#### 1. Google Cloudプロジェクトの作成

```bash
# gcloud CLIのインストールと認証
gcloud auth login
gcloud config set project [PROJECT_ID]
```

#### 2. Cloud SQL（PostgreSQL）のセットアップ

```bash
# Cloud SQLインスタンスを作成
gcloud sql instances create daily-report-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=asia-northeast1

# データベースを作成
gcloud sql databases create daily_report \
  --instance=daily-report-db

# ユーザーを作成
gcloud sql users create daily_report_user \
  --instance=daily-report-db \
  --password=[PASSWORD]
```

#### 3. Dockerイメージのビルドとプッシュ

```bash
# Artifact Registryにリポジトリを作成
gcloud artifacts repositories create daily-report \
  --repository-format=docker \
  --location=asia-northeast1

# Dockerイメージをビルド
docker build -t asia-northeast1-docker.pkg.dev/[PROJECT_ID]/daily-report/app:latest .

# イメージをプッシュ
docker push asia-northeast1-docker.pkg.dev/[PROJECT_ID]/daily-report/app:latest
```

#### 4. Cloud Runにデプロイ

```bash
gcloud run deploy daily-report \
  --image=asia-northeast1-docker.pkg.dev/[PROJECT_ID]/daily-report/app:latest \
  --platform=managed \
  --region=asia-northeast1 \
  --allow-unauthenticated \
  --add-cloudsql-instances=[PROJECT_ID]:asia-northeast1:daily-report-db \
  --set-env-vars DATABASE_URL="postgresql://..." \
  --set-env-vars SESSION_SECRET="..."
```

#### 5. マイグレーションの実行

```bash
# Cloud Runのコンテナに接続してマイグレーション実行
gcloud run services update daily-report \
  --command="npx" \
  --args="prisma,migrate,deploy"
```

### CI/CDパイプライン（GitHub Actions）

`.github/workflows/deploy.yml` を作成してCI/CD自動化を実装することを推奨します。

---

## 貢献

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `bugfix/*`: バグ修正
- `hotfix/*`: 緊急修正

### コミットメッセージ

Conventional Commitsに従う：

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更（機能に影響なし）
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```

例：
```
feat: 日報承認機能を追加
fix: 日報一覧の表示バグを修正
docs: API仕様書を更新
```

### プルリクエスト

1. featureブランチを作成
2. 変更をコミット
3. テストを実行して成功を確認
4. developブランチへプルリクエストを作成
5. レビューを受けてマージ

---

## トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
docker ps

# 接続情報を確認
echo $DATABASE_URL
```

### マイグレーションエラー

```bash
# マイグレーションをリセット
npx prisma migrate reset

# スキーマを確認
npx prisma validate
```

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install

# Prisma Clientを再生成
npx prisma generate
```

---

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

## 連絡先

プロジェクトに関する質問や提案は、GitHubのIssuesで受け付けています。

- GitHub: https://github.com/masakazoo1979/dailyReport
- Issues: https://github.com/masakazoo1979/dailyReport/issues

---

## 改訂履歴

| 版数 | 改訂日 | 改訂内容 | 作成者 |
|------|--------|---------|--------|
| 1.0 | 2024/01/06 | 初版作成 | - |

---

**🤖 Generated with Claude Code**
