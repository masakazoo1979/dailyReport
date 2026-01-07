# デプロイメントガイド

営業日報システムのCloud Runへのデプロイ手順を説明します。

## 目次

- [前提条件](#前提条件)
- [初期セットアップ](#初期セットアップ)
- [環境変数の設定](#環境変数の設定)
- [デプロイ方法](#デプロイ方法)
- [Makefileコマンド一覧](#makefileコマンド一覧)
- [CI/CD パイプライン](#cicd-パイプライン)
- [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必要なツール

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Docker](https://docs.docker.com/get-docker/)
- [Make](https://www.gnu.org/software/make/)
- Node.js 20以上

### Google Cloudプロジェクト情報

- **Project ID**: `claudecode1-482612`
- **Region**: `asia-northeast1`
- **Service Name**: `daily-report`

---

## 初期セットアップ

### 1. Google Cloud認証

```bash
# Google Cloudにログイン
make gcloud-auth

# Dockerの認証設定
make gcloud-configure-docker
```

または手動で：

```bash
gcloud auth login
gcloud config set project claudecode1-482612
gcloud auth configure-docker
```

### 2. Cloud SQLのセットアップ

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
  --password=[YOUR_PASSWORD]
```

### 3. Secret Managerに環境変数を登録

```bash
# DATABASE_URLを登録
echo -n "postgresql://daily_report_user:[PASSWORD]@[INSTANCE_CONNECTION_NAME]/daily_report?schema=public" | \
  gcloud secrets create DATABASE_URL --data-file=-

# SESSION_SECRETを登録
echo -n "your-secret-key-here-change-in-production" | \
  gcloud secrets create SESSION_SECRET --data-file=-
```

### 4. サービスアカウントに権限を付与

```bash
# Cloud Runサービスアカウントにシークレットアクセス権限を付与
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:YOUR-PROJECT-NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding SESSION_SECRET \
  --member="serviceAccount:YOUR-PROJECT-NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 環境変数の設定

### ローカル開発用（.env）

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daily_report?schema=public"
SESSION_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=3000
```

### 本番環境（Cloud Run）

Secret Managerを使用して環境変数を管理します。

---

## デプロイ方法

### 方法1: Makefileを使用（推奨）

#### フルデプロイ（ビルド + プッシュ + デプロイ）

```bash
make deploy-full
```

#### ステップごとにデプロイ

```bash
# 1. Dockerイメージをビルド&プッシュ
make deploy-build

# 2. Cloud Runにデプロイ
make deploy
```

### 方法2: 手動デプロイ

#### Dockerイメージをビルド

```bash
docker build -t gcr.io/claudecode1-482612/daily-report:latest .
```

#### GCRにプッシュ

```bash
docker push gcr.io/claudecode1-482612/daily-report:latest
```

#### Cloud Runにデプロイ

```bash
gcloud run deploy daily-report \
  --image gcr.io/claudecode1-482612/daily-report:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=3000" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,SESSION_SECRET=SESSION_SECRET:latest"
```

### 方法3: GitHub Actions（自動デプロイ）

`master`ブランチにプッシュすると、GitHub Actionsが自動的にデプロイします。

---

## Makefileコマンド一覧

### 開発用コマンド

| コマンド          | 説明                            |
| ----------------- | ------------------------------- |
| `make help`       | 利用可能なコマンドを表示        |
| `make install`    | 依存パッケージをインストール    |
| `make dev`        | 開発サーバーを起動              |
| `make build`      | Next.jsアプリケーションをビルド |
| `make test`       | すべてのテストを実行            |
| `make test-e2e`   | E2Eテストを実行                 |
| `make lint`       | リンターを実行                  |
| `make format`     | コードをフォーマット            |
| `make type-check` | TypeScript型チェックを実行      |

### Prisma関連コマンド

| コマンド               | 説明                         |
| ---------------------- | ---------------------------- |
| `make prisma-generate` | Prisma Clientを生成          |
| `make prisma-migrate`  | Prismaマイグレーションを実行 |

### Docker関連コマンド

| コマンド            | 説明                           |
| ------------------- | ------------------------------ |
| `make docker-build` | Dockerイメージをビルド         |
| `make docker-run`   | Dockerコンテナをローカルで実行 |
| `make docker-push`  | DockerイメージをGCRにプッシュ  |

### デプロイコマンド

| コマンド                       | 説明                                     |
| ------------------------------ | ---------------------------------------- |
| `make gcloud-auth`             | Google Cloudに認証                       |
| `make gcloud-configure-docker` | DockerのGCR認証を設定                    |
| `make deploy-build`            | Dockerイメージをビルド&プッシュ          |
| `make deploy`                  | Cloud Runにデプロイ                      |
| `make deploy-full`             | フルデプロイ（ビルド+プッシュ+デプロイ） |

### 運用コマンド

| コマンド        | 説明                          |
| --------------- | ----------------------------- |
| `make logs`     | Cloud Runのログを表示         |
| `make describe` | Cloud Runサービスの詳細を表示 |
| `make delete`   | Cloud Runサービスを削除       |

### その他

| コマンド     | 説明                         |
| ------------ | ---------------------------- |
| `make clean` | ビルド成果物をクリーンアップ |
| `make ci`    | CIチェックをローカルで実行   |

---

## CI/CD パイプライン

### GitHub Actions ワークフロー

#### 1. CI ワークフロー（`.github/workflows/ci.yml`）

**トリガー**: Pull Request、プッシュ（masterまたはdevelopブランチ）

**ジョブ**:

- **test**: リント、型チェック、テスト、ビルド
- **e2e**: E2Eテスト実行、レポートアップロード

#### 2. デプロイワークフロー（`.github/workflows/deploy.yml`）

**トリガー**: masterブランチへのプッシュ

**ステップ**:

1. コードチェックアウト
2. 依存関係インストール
3. リント・型チェック・テスト実行
4. Google Cloud認証
5. Dockerイメージビルド&プッシュ
6. Cloud Runへデプロイ
7. デプロイURLをコメント（PRの場合）

### GitHub Secretsの設定

以下のシークレットをGitHubリポジトリに設定してください：

| シークレット名 | 説明                                     |
| -------------- | ---------------------------------------- |
| `GCP_SA_KEY`   | Google CloudサービスアカウントのJSONキー |

#### サービスアカウントの作成手順

```bash
# サービスアカウントを作成
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 必要な権限を付与
gcloud projects add-iam-policy-binding claudecode1-482612 \
  --member="serviceAccount:github-actions@claudecode1-482612.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding claudecode1-482612 \
  --member="serviceAccount:github-actions@claudecode1-482612.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding claudecode1-482612 \
  --member="serviceAccount:github-actions@claudecode1-482612.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# JSONキーを作成
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@claudecode1-482612.iam.gserviceaccount.com

# key.jsonの内容をGitHub SecretsのGCP_SA_KEYに登録
```

---

## トラブルシューティング

### ビルドエラー

#### エラー: Prisma Clientが見つからない

```bash
# Prisma Clientを再生成
make prisma-generate
```

#### エラー: TypeScript型エラー

```bash
# 型チェックを実行
make type-check
```

### デプロイエラー

#### エラー: 認証エラー

```bash
# 再認証
make gcloud-auth
make gcloud-configure-docker
```

#### エラー: イメージがプッシュできない

```bash
# Docker認証を確認
gcloud auth configure-docker

# 手動でプッシュ
docker push gcr.io/claudecode1-482612/daily-report:latest
```

### Cloud Runエラー

#### サービスが起動しない

```bash
# ログを確認
make logs

# サービスの詳細を確認
make describe
```

#### データベース接続エラー

- Secret Managerの`DATABASE_URL`が正しく設定されているか確認
- Cloud SQLとCloud Runが同じリージョンにあるか確認
- サービスアカウントに適切な権限があるか確認

---

## 参考リンク

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Cloud Run](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud-run)
- [GitHub Actions](https://docs.github.com/actions)

---

**最終更新**: 2025/01/07
