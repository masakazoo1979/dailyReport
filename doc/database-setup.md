# データベースセットアップガイド

## 概要

このプロジェクトでは、ORMとして **Prisma** を使用し、データベースには **PostgreSQL** を採用しています。

## 前提条件

- Node.js (v18以上推奨)
- PostgreSQL (v14以上推奨)
- npm または yarn

## セットアップ手順

### 1. PostgreSQLのインストールと起動

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

#### ローカルインストールの場合

PostgreSQLをインストール後、データベースを作成：

```bash
# PostgreSQLに接続
psql -U postgres

# データベース作成
CREATE DATABASE daily_report;

# ユーザー作成（必要に応じて）
CREATE USER daily_report_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE daily_report TO daily_report_user;
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成：

```bash
cp .env.example .env
```

`.env` ファイルを編集してデータベース接続情報を設定：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daily_report?schema=public"
```

**接続文字列の形式:**

```
postgresql://[ユーザー名]:[パスワード]@[ホスト]:[ポート]/[データベース名]?schema=public
```

### 3. Prisma CLIのインストール

```bash
npm install -D prisma
npm install @prisma/client
```

### 4. データベースマイグレーション

#### 初回マイグレーション

```bash
# Prismaクライアントの生成
npx prisma generate

# マイグレーションファイルの作成と実行
npx prisma migrate dev --name init
```

このコマンドにより：

1. `prisma/migrations` ディレクトリにマイグレーションファイルが作成される
2. データベースにテーブルが作成される
3. Prisma Clientが最新のスキーマで再生成される

#### マイグレーションの確認

```bash
# マイグレーションステータスの確認
npx prisma migrate status

# データベースの状態を確認
npx prisma db push --preview-feature
```

### 5. Prisma Studioでデータを確認

```bash
# Prisma Studioを起動（GUIでデータベースを確認・編集）
npx prisma studio
```

ブラウザで `http://localhost:5555` が開き、データベースの内容を確認できます。

## スキーマ構成

### テーブル一覧

| テーブル名    | 説明             |
| ------------- | ---------------- |
| sales         | 営業担当者マスタ |
| customers     | 顧客マスタ       |
| daily_reports | 日報             |
| visits        | 訪問記録         |
| comments      | コメント         |

### リレーション

```
Sales (営業)
  ├─ DailyReport (日報) - 1:N
  ├─ Comment (コメント) - 1:N
  └─ Sales (上長) - 自己参照

Customer (顧客)
  └─ Visit (訪問記録) - 1:N

DailyReport (日報)
  ├─ Visit (訪問記録) - 1:N
  └─ Comment (コメント) - 1:N
```

## Prisma Clientの使用方法

### 基本的な使い方

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 日報の取得
const reports = await prisma.dailyReport.findMany({
  where: {
    salesId: 1,
    status: '提出済み',
  },
  include: {
    visits: true,
    comments: true,
    sales: true,
  },
});

// 日報の作成
const newReport = await prisma.dailyReport.create({
  data: {
    salesId: 1,
    reportDate: new Date('2024-01-06'),
    status: '下書き',
    problem: '新規顧客の開拓が課題',
    plan: '明日はB社訪問',
    visits: {
      create: [
        {
          customerId: 10,
          visitTime: new Date('2024-01-06T09:00:00'),
          visitContent: '新規提案の説明を実施',
        },
      ],
    },
  },
});

// トランザクション
await prisma.$transaction(async (tx) => {
  // 日報のステータスを更新
  await tx.dailyReport.update({
    where: { reportId: 1 },
    data: { status: '承認済み', approvedAt: new Date() },
  });

  // コメントを追加
  await tx.comment.create({
    data: {
      reportId: 1,
      salesId: 5,
      commentContent: '承認しました',
    },
  });
});
```

## 開発時の便利なコマンド

### マイグレーション

```bash
# 新しいマイグレーションを作成
npx prisma migrate dev --name [マイグレーション名]

# マイグレーションをリセット（全データ削除）
npx prisma migrate reset

# 本番環境へのマイグレーション適用
npx prisma migrate deploy
```

### スキーマ

```bash
# スキーマからデータベースを更新（マイグレーションなし）
npx prisma db push

# データベースからスキーマを生成（既存DBをPrismaに移行する場合）
npx prisma db pull

# スキーマのフォーマット
npx prisma format

# スキーマの検証
npx prisma validate
```

### データ管理

```bash
# シードデータの投入
npx prisma db seed
```

シードスクリプトは `prisma/seed.ts` に記述します。

### Prisma Client

```bash
# Prisma Clientの再生成
npx prisma generate
```

## シードデータの作成

`prisma/seed.ts` ファイルを作成：

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 上長ユーザーを作成
  const manager = await prisma.sales.create({
    data: {
      salesName: '佐藤上長',
      email: 'manager@example.com',
      password: hashedPassword,
      department: '営業1部',
      role: '上長',
    },
  });

  // 一般営業ユーザーを作成
  const sales = await prisma.sales.create({
    data: {
      salesName: '山田太郎',
      email: 'yamada@example.com',
      password: hashedPassword,
      department: '営業1部',
      role: '一般',
      managerId: manager.salesId,
    },
  });

  // 顧客を作成
  const customer = await prisma.customer.create({
    data: {
      customerName: '鈴木一郎',
      companyName: 'ABC株式会社',
      industry: 'IT',
      phone: '03-1234-5678',
      email: 'suzuki@abc.co.jp',
    },
  });

  console.log({ manager, sales, customer });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

`package.json` に追加：

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

実行：

```bash
npx prisma db seed
```

## トラブルシューティング

### マイグレーションエラー

```bash
# マイグレーションをリセット
npx prisma migrate reset

# 強制的にマイグレーションを解決
npx prisma migrate resolve --applied [マイグレーション名]
```

### 接続エラー

- `.env` ファイルのDATABASE_URLが正しいか確認
- PostgreSQLが起動しているか確認
- ファイアウォールやポートの設定を確認

### スキーマの変更が反映されない

```bash
# Prisma Clientを再生成
npx prisma generate

# キャッシュをクリア
rm -rf node_modules/.prisma
npm install
```

## 本番環境へのデプロイ

### 環境変数の設定

本番環境では、安全な方法でDATABASE_URLを設定：

- 環境変数として設定
- シークレット管理サービスを使用（AWS Secrets Manager, Azure Key Vault等）

### マイグレーションの適用

```bash
# 本番環境でマイグレーションを適用
npx prisma migrate deploy
```

**注意:** `migrate deploy` は `migrate dev` と異なり、マイグレーションファイルを作成せず、既存のマイグレーションのみを適用します。

### 接続プーリング

本番環境では接続プーリングを使用することを推奨：

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
```

## セキュリティベストプラクティス

1. **環境変数の保護**
   - `.env` ファイルを `.gitignore` に追加
   - 本番環境の認証情報を安全に管理

2. **パスワードのハッシュ化**
   - bcryptなどを使用してパスワードをハッシュ化

3. **SQLインジェクション対策**
   - Prismaは自動的にパラメータ化されたクエリを使用

4. **最小権限の原則**
   - データベースユーザーには必要最小限の権限のみを付与

## 参考リンク

- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## 改訂履歴

| 版数 | 改訂日     | 改訂内容 | 作成者 |
| ---- | ---------- | -------- | ------ |
| 1.0  | 2024/01/06 | 初版作成 | -      |
