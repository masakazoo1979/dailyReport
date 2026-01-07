# 営業日報システム API仕様書

## 1. API概要

### 1.1 ベースURL
```
https://api.daily-report.example.com/v1
```

### 1.2 プロトコル
- HTTPS通信のみ
- HTTP/1.1、HTTP/2対応

### 1.3 データ形式
- リクエスト: JSON形式（Content-Type: application/json）
- レスポンス: JSON形式
- 文字コード: UTF-8

### 1.4 APIバージョン
- 現在のバージョン: v1
- バージョンはURLパスに含める

---

## 2. 認証・セキュリティ

### 2.1 認証方式
- セッションベース認証
- Cookie（httpOnly, secure）によるセッション管理

### 2.2 認証フロー
1. `/auth/login` エンドポイントでログイン
2. セッションCookieが発行される
3. 以降のリクエストでCookieを自動送信
4. `/auth/logout` でログアウト

### 2.3 セキュリティヘッダー
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 2.4 CSRF対策
- CSRFトークンをヘッダー `X-CSRF-Token` に含める
- ログイン後に `/auth/csrf-token` でトークンを取得

---

## 3. 共通仕様

### 3.1 HTTPメソッド

| メソッド | 用途 |
|---------|------|
| GET | リソースの取得 |
| POST | リソースの新規作成 |
| PUT | リソースの更新 |
| DELETE | リソースの削除 |

### 3.2 共通リクエストヘッダー

| ヘッダー名 | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| Content-Type | ○ | コンテンツタイプ | application/json |
| X-CSRF-Token | ○* | CSRFトークン | abc123... |
| Accept | - | 受け入れ形式 | application/json |

*POST/PUT/DELETEメソッドのみ必須

### 3.3 共通レスポンスヘッダー

| ヘッダー名 | 説明 |
|-----------|------|
| Content-Type | application/json; charset=utf-8 |
| X-Request-Id | リクエストID（ログトレース用） |

### 3.4 成功レスポンス形式

#### 単一リソース取得/作成/更新
```json
{
  "data": {
    "id": 1,
    "name": "example",
    ...
  }
}
```

#### 複数リソース取得（一覧）
```json
{
  "data": [
    {
      "id": 1,
      ...
    },
    {
      "id": 2,
      ...
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

#### 削除成功
```json
{
  "message": "削除しました"
}
```

### 3.5 エラーレスポンス形式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": [
      {
        "field": "email",
        "message": "メールアドレスの形式が正しくありません"
      }
    ]
  }
}
```

### 3.6 HTTPステータスコード

| コード | 説明 | 使用例 |
|-------|------|--------|
| 200 | OK | リソース取得成功 |
| 201 | Created | リソース作成成功 |
| 204 | No Content | 削除成功 |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限エラー |
| 404 | Not Found | リソースが存在しない |
| 409 | Conflict | リソースの競合 |
| 422 | Unprocessable Entity | バリデーションエラー |
| 500 | Internal Server Error | サーバーエラー |

### 3.7 ページネーション

クエリパラメータで指定：
- `page`: ページ番号（デフォルト: 1）
- `per_page`: 1ページあたりの件数（デフォルト: 20、最大: 100）

例:
```
GET /reports?page=2&per_page=50
```

### 3.8 ソート

クエリパラメータで指定：
- `sort`: ソート対象フィールド
- `order`: 昇順（asc）または降順（desc）

例:
```
GET /reports?sort=report_date&order=desc
```

### 3.9 日時形式

- 日付: `YYYY-MM-DD`
- 時刻: `HH:MM:SS`
- 日時: `YYYY-MM-DDTHH:MM:SSZ`（ISO 8601形式、UTC）

---

## 4. エンドポイント一覧

### 4.1 認証

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| POST | /auth/login | ログイン | 不要 |
| POST | /auth/logout | ログアウト | 必要 |
| GET | /auth/me | ログインユーザー情報取得 | 必要 |
| GET | /auth/csrf-token | CSRFトークン取得 | 必要 |

### 4.2 日報

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /reports | 日報一覧取得 | 必要 |
| GET | /reports/:id | 日報詳細取得 | 必要 |
| POST | /reports | 日報作成 | 必要 |
| PUT | /reports/:id | 日報更新 | 必要 |
| DELETE | /reports/:id | 日報削除 | 必要 |
| POST | /reports/:id/submit | 日報提出 | 必要 |
| POST | /reports/:id/approve | 日報承認 | 必要（上長） |
| POST | /reports/:id/reject | 日報差し戻し | 必要（上長） |

### 4.3 訪問記録

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /reports/:report_id/visits | 訪問記録一覧取得 | 必要 |
| POST | /reports/:report_id/visits | 訪問記録作成 | 必要 |
| PUT | /visits/:id | 訪問記録更新 | 必要 |
| DELETE | /visits/:id | 訪問記録削除 | 必要 |

### 4.4 コメント

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /reports/:report_id/comments | コメント一覧取得 | 必要 |
| POST | /reports/:report_id/comments | コメント投稿 | 必要 |
| DELETE | /comments/:id | コメント削除 | 必要 |

### 4.5 顧客

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /customers | 顧客一覧取得 | 必要 |
| GET | /customers/:id | 顧客詳細取得 | 必要 |
| POST | /customers | 顧客作成 | 必要 |
| PUT | /customers/:id | 顧客更新 | 必要 |
| DELETE | /customers/:id | 顧客削除 | 必要 |

### 4.6 営業担当者

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| GET | /sales | 営業担当者一覧取得 | 必要（上長） |
| GET | /sales/:id | 営業担当者詳細取得 | 必要 |
| POST | /sales | 営業担当者作成 | 必要（上長） |
| PUT | /sales/:id | 営業担当者更新 | 必要（上長） |
| DELETE | /sales/:id | 営業担当者削除 | 必要（上長） |

---

## 5. API詳細仕様

### 5.1 認証API

#### POST /auth/login
ログイン

**リクエスト**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス（200 OK）**
```json
{
  "data": {
    "sales_id": 1,
    "sales_name": "山田太郎",
    "email": "user@example.com",
    "department": "営業1部",
    "role": "一般"
  }
}
```

**エラーレスポンス（401 Unauthorized）**
```json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

#### POST /auth/logout
ログアウト

**リクエスト**
```
（リクエストボディなし）
```

**レスポンス（200 OK）**
```json
{
  "message": "ログアウトしました"
}
```

---

#### GET /auth/me
ログインユーザー情報取得

**レスポンス（200 OK）**
```json
{
  "data": {
    "sales_id": 1,
    "sales_name": "山田太郎",
    "email": "user@example.com",
    "department": "営業1部",
    "role": "一般",
    "manager_id": 5,
    "manager_name": "佐藤花子"
  }
}
```

---

#### GET /auth/csrf-token
CSRFトークン取得

**レスポンス（200 OK）**
```json
{
  "data": {
    "csrf_token": "abc123def456..."
  }
}
```

---

### 5.2 日報API

#### GET /reports
日報一覧取得

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|---|------|------|-----|
| start_date | string | - | 期間開始日 | 2024-01-01 |
| end_date | string | - | 期間終了日 | 2024-01-31 |
| sales_id | integer | - | 営業担当者ID（上長のみ） | 1 |
| status | string | - | ステータス | 提出済み |
| page | integer | - | ページ番号 | 1 |
| per_page | integer | - | 1ページあたり件数 | 20 |
| sort | string | - | ソート対象 | report_date |
| order | string | - | ソート順（asc/desc） | desc |

**レスポンス（200 OK）**
```json
{
  "data": [
    {
      "report_id": 1,
      "sales_id": 1,
      "sales_name": "山田太郎",
      "report_date": "2024-01-06",
      "status": "提出済み",
      "submitted_at": "2024-01-06T18:30:00Z",
      "approved_at": null,
      "approved_by": null,
      "visit_count": 3,
      "comment_count": 1,
      "created_at": "2024-01-06T09:00:00Z",
      "updated_at": "2024-01-06T18:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  }
}
```

---

#### GET /reports/:id
日報詳細取得

**パスパラメータ**
- `id`: 日報ID

**レスポンス（200 OK）**
```json
{
  "data": {
    "report_id": 1,
    "sales_id": 1,
    "sales_name": "山田太郎",
    "department": "営業1部",
    "report_date": "2024-01-06",
    "problem": "新規顧客の開拓が課題です。",
    "plan": "明日はB社へ訪問予定です。",
    "status": "提出済み",
    "submitted_at": "2024-01-06T18:30:00Z",
    "approved_at": null,
    "approved_by": null,
    "approved_by_name": null,
    "visits": [
      {
        "visit_id": 1,
        "customer_id": 10,
        "customer_name": "鈴木一郎",
        "company_name": "ABC株式会社",
        "visit_time": "09:00:00",
        "visit_content": "新規提案の説明を実施。好感触を得た。",
        "created_at": "2024-01-06T09:00:00Z",
        "updated_at": "2024-01-06T09:00:00Z"
      }
    ],
    "comments": [
      {
        "comment_id": 1,
        "sales_id": 5,
        "sales_name": "佐藤花子",
        "comment_content": "良い進捗ですね。引き続き頑張ってください。",
        "created_at": "2024-01-06T19:00:00Z"
      }
    ],
    "created_at": "2024-01-06T09:00:00Z",
    "updated_at": "2024-01-06T18:30:00Z"
  }
}
```

**エラーレスポンス（404 Not Found）**
```json
{
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "日報が見つかりません"
  }
}
```

**エラーレスポンス（403 Forbidden）**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "この日報にアクセスする権限がありません"
  }
}
```

---

#### POST /reports
日報作成

**リクエスト**
```json
{
  "report_date": "2024-01-06",
  "problem": "新規顧客の開拓が課題です。",
  "plan": "明日はB社へ訪問予定です。",
  "status": "下書き"
}
```

**バリデーション**

| フィールド | 必須 | 型 | 制約 |
|-----------|------|---|------|
| report_date | ○ | string | YYYY-MM-DD形式、同日の日報が存在しないこと |
| problem | - | string | 2000文字以内 |
| plan | - | string | 2000文字以内 |
| status | ○ | string | "下書き" または "提出済み" |

**レスポンス（201 Created）**
```json
{
  "data": {
    "report_id": 1,
    "sales_id": 1,
    "sales_name": "山田太郎",
    "report_date": "2024-01-06",
    "problem": "新規顧客の開拓が課題です。",
    "plan": "明日はB社へ訪問予定です。",
    "status": "下書き",
    "submitted_at": null,
    "approved_at": null,
    "approved_by": null,
    "visits": [],
    "comments": [],
    "created_at": "2024-01-06T09:00:00Z",
    "updated_at": "2024-01-06T09:00:00Z"
  }
}
```

**エラーレスポンス（422 Unprocessable Entity）**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "report_date",
        "message": "同じ日付の日報が既に存在します"
      }
    ]
  }
}
```

---

#### PUT /reports/:id
日報更新

**パスパラメータ**
- `id`: 日報ID

**リクエスト**
```json
{
  "problem": "新規顧客の開拓が課題です。追加で既存顧客のフォローも必要。",
  "plan": "明日はB社へ訪問予定です。"
}
```

**レスポンス（200 OK）**
```json
{
  "data": {
    "report_id": 1,
    "sales_id": 1,
    "sales_name": "山田太郎",
    "report_date": "2024-01-06",
    "problem": "新規顧客の開拓が課題です。追加で既存顧客のフォローも必要。",
    "plan": "明日はB社へ訪問予定です。",
    "status": "下書き",
    "submitted_at": null,
    "approved_at": null,
    "approved_by": null,
    "created_at": "2024-01-06T09:00:00Z",
    "updated_at": "2024-01-06T10:00:00Z"
  }
}
```

**エラーレスポンス（403 Forbidden）**
```json
{
  "error": {
    "code": "REPORT_NOT_EDITABLE",
    "message": "この日報は編集できません"
  }
}
```

---

#### DELETE /reports/:id
日報削除

**パスパラメータ**
- `id`: 日報ID

**レスポンス（204 No Content）**
```
（レスポンスボディなし）
```

**エラーレスポンス（403 Forbidden）**
```json
{
  "error": {
    "code": "REPORT_NOT_DELETABLE",
    "message": "この日報は削除できません"
  }
}
```

---

#### POST /reports/:id/submit
日報提出

**パスパラメータ**
- `id`: 日報ID

**リクエスト**
```
（リクエストボディなし）
```

**レスポンス（200 OK）**
```json
{
  "data": {
    "report_id": 1,
    "status": "提出済み",
    "submitted_at": "2024-01-06T18:30:00Z"
  }
}
```

**エラーレスポンス（422 Unprocessable Entity）**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "日報を提出するには、訪問記録を1件以上登録してください"
  }
}
```

---

#### POST /reports/:id/approve
日報承認（上長のみ）

**パスパラメータ**
- `id`: 日報ID

**リクエスト**
```
（リクエストボディなし）
```

**レスポンス（200 OK）**
```json
{
  "data": {
    "report_id": 1,
    "status": "承認済み",
    "approved_at": "2024-01-07T09:00:00Z",
    "approved_by": 5,
    "approved_by_name": "佐藤花子"
  }
}
```

**エラーレスポンス（403 Forbidden）**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "この操作を実行する権限がありません"
  }
}
```

---

#### POST /reports/:id/reject
日報差し戻し（上長のみ）

**パスパラメータ**
- `id`: 日報ID

**リクエスト**
```json
{
  "comment": "訪問内容をもう少し詳しく記載してください。"
}
```

**レスポンス（200 OK）**
```json
{
  "data": {
    "report_id": 1,
    "status": "差し戻し"
  }
}
```

---

### 5.3 訪問記録API

#### GET /reports/:report_id/visits
訪問記録一覧取得

**パスパラメータ**
- `report_id`: 日報ID

**レスポンス（200 OK）**
```json
{
  "data": [
    {
      "visit_id": 1,
      "report_id": 1,
      "customer_id": 10,
      "customer_name": "鈴木一郎",
      "company_name": "ABC株式会社",
      "visit_time": "09:00:00",
      "visit_content": "新規提案の説明を実施。好感触を得た。",
      "created_at": "2024-01-06T09:00:00Z",
      "updated_at": "2024-01-06T09:00:00Z"
    }
  ]
}
```

---

#### POST /reports/:report_id/visits
訪問記録作成

**パスパラメータ**
- `report_id`: 日報ID

**リクエスト**
```json
{
  "customer_id": 10,
  "visit_time": "09:00",
  "visit_content": "新規提案の説明を実施。好感触を得た。"
}
```

**バリデーション**

| フィールド | 必須 | 型 | 制約 |
|-----------|------|---|------|
| customer_id | ○ | integer | 存在する顧客ID |
| visit_time | ○ | string | HH:MM形式 |
| visit_content | ○ | string | 1000文字以内 |

**レスポンス（201 Created）**
```json
{
  "data": {
    "visit_id": 1,
    "report_id": 1,
    "customer_id": 10,
    "customer_name": "鈴木一郎",
    "company_name": "ABC株式会社",
    "visit_time": "09:00:00",
    "visit_content": "新規提案の説明を実施。好感触を得た。",
    "created_at": "2024-01-06T09:00:00Z",
    "updated_at": "2024-01-06T09:00:00Z"
  }
}
```

---

#### PUT /visits/:id
訪問記録更新

**パスパラメータ**
- `id`: 訪問記録ID

**リクエスト**
```json
{
  "customer_id": 10,
  "visit_time": "09:30",
  "visit_content": "新規提案の説明を実施。好感触を得た。次回フォローアップ予定。"
}
```

**レスポンス（200 OK）**
```json
{
  "data": {
    "visit_id": 1,
    "report_id": 1,
    "customer_id": 10,
    "customer_name": "鈴木一郎",
    "company_name": "ABC株式会社",
    "visit_time": "09:30:00",
    "visit_content": "新規提案の説明を実施。好感触を得た。次回フォローアップ予定。",
    "created_at": "2024-01-06T09:00:00Z",
    "updated_at": "2024-01-06T10:00:00Z"
  }
}
```

---

#### DELETE /visits/:id
訪問記録削除

**パスパラメータ**
- `id`: 訪問記録ID

**レスポンス（204 No Content）**
```
（レスポンスボディなし）
```

---

### 5.4 コメントAPI

#### GET /reports/:report_id/comments
コメント一覧取得

**パスパラメータ**
- `report_id`: 日報ID

**レスポンス（200 OK）**
```json
{
  "data": [
    {
      "comment_id": 1,
      "report_id": 1,
      "sales_id": 5,
      "sales_name": "佐藤花子",
      "role": "上長",
      "comment_content": "良い進捗ですね。引き続き頑張ってください。",
      "created_at": "2024-01-06T19:00:00Z"
    }
  ]
}
```

---

#### POST /reports/:report_id/comments
コメント投稿

**パスパラメータ**
- `report_id`: 日報ID

**リクエスト**
```json
{
  "comment_content": "良い進捗ですね。引き続き頑張ってください。"
}
```

**バリデーション**

| フィールド | 必須 | 型 | 制約 |
|-----------|------|---|------|
| comment_content | ○ | string | 1000文字以内 |

**レスポンス（201 Created）**
```json
{
  "data": {
    "comment_id": 1,
    "report_id": 1,
    "sales_id": 5,
    "sales_name": "佐藤花子",
    "role": "上長",
    "comment_content": "良い進捗ですね。引き続き頑張ってください。",
    "created_at": "2024-01-06T19:00:00Z"
  }
}
```

---

#### DELETE /comments/:id
コメント削除

**パスパラメータ**
- `id`: コメントID

**レスポンス（204 No Content）**
```
（レスポンスボディなし）
```

**エラーレスポンス（403 Forbidden）**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "自分のコメントのみ削除できます"
  }
}
```

---

### 5.5 顧客API

#### GET /customers
顧客一覧取得

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|---|------|------|-----|
| company_name | string | - | 会社名（部分一致） | ABC |
| industry | string | - | 業種 | IT |
| page | integer | - | ページ番号 | 1 |
| per_page | integer | - | 1ページあたり件数 | 20 |

**レスポンス（200 OK）**
```json
{
  "data": [
    {
      "customer_id": 10,
      "customer_name": "鈴木一郎",
      "company_name": "ABC株式会社",
      "industry": "IT",
      "phone": "03-1234-5678",
      "email": "suzuki@abc.co.jp",
      "address": "東京都千代田区...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

---

#### GET /customers/:id
顧客詳細取得

**パスパラメータ**
- `id`: 顧客ID

**レスポンス（200 OK）**
```json
{
  "data": {
    "customer_id": 10,
    "customer_name": "鈴木一郎",
    "company_name": "ABC株式会社",
    "industry": "IT",
    "phone": "03-1234-5678",
    "email": "suzuki@abc.co.jp",
    "address": "東京都千代田区...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST /customers
顧客作成

**リクエスト**
```json
{
  "customer_name": "鈴木一郎",
  "company_name": "ABC株式会社",
  "industry": "IT",
  "phone": "03-1234-5678",
  "email": "suzuki@abc.co.jp",
  "address": "東京都千代田区..."
}
```

**バリデーション**

| フィールド | 必須 | 型 | 制約 |
|-----------|------|---|------|
| customer_name | ○ | string | 100文字以内 |
| company_name | ○ | string | 255文字以内 |
| industry | - | string | IT/製造/金融/小売/サービス/その他 |
| phone | - | string | 20文字以内、電話番号形式 |
| email | - | string | 255文字以内、メールアドレス形式 |
| address | - | string | 500文字以内 |

**レスポンス（201 Created）**
```json
{
  "data": {
    "customer_id": 10,
    "customer_name": "鈴木一郎",
    "company_name": "ABC株式会社",
    "industry": "IT",
    "phone": "03-1234-5678",
    "email": "suzuki@abc.co.jp",
    "address": "東京都千代田区...",
    "created_at": "2024-01-06T10:00:00Z",
    "updated_at": "2024-01-06T10:00:00Z"
  }
}
```

---

#### PUT /customers/:id
顧客更新

**パスパラメータ**
- `id`: 顧客ID

**リクエスト**
```json
{
  "customer_name": "鈴木一郎",
  "company_name": "ABC株式会社",
  "industry": "IT",
  "phone": "03-1234-9999",
  "email": "suzuki@abc.co.jp",
  "address": "東京都千代田区..."
}
```

**レスポンス（200 OK）**
```json
{
  "data": {
    "customer_id": 10,
    "customer_name": "鈴木一郎",
    "company_name": "ABC株式会社",
    "industry": "IT",
    "phone": "03-1234-9999",
    "email": "suzuki@abc.co.jp",
    "address": "東京都千代田区...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-06T11:00:00Z"
  }
}
```

---

#### DELETE /customers/:id
顧客削除

**パスパラメータ**
- `id`: 顧客ID

**レスポンス（204 No Content）**
```
（レスポンスボディなし）
```

**エラーレスポンス（409 Conflict）**
```json
{
  "error": {
    "code": "CUSTOMER_IN_USE",
    "message": "この顧客は訪問記録で使用されているため削除できません"
  }
}
```

---

### 5.6 営業担当者API

#### GET /sales
営業担当者一覧取得（上長のみ）

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|---|------|------|-----|
| sales_name | string | - | 担当者名（部分一致） | 山田 |
| department | string | - | 部署 | 営業1部 |
| role | string | - | 役割（一般/上長） | 一般 |
| page | integer | - | ページ番号 | 1 |
| per_page | integer | - | 1ページあたり件数 | 20 |

**レスポンス（200 OK）**
```json
{
  "data": [
    {
      "sales_id": 1,
      "sales_name": "山田太郎",
      "email": "yamada@example.com",
      "department": "営業1部",
      "role": "一般",
      "manager_id": 5,
      "manager_name": "佐藤花子",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

---

#### GET /sales/:id
営業担当者詳細取得

**パスパラメータ**
- `id`: 営業担当者ID

**レスポンス（200 OK）**
```json
{
  "data": {
    "sales_id": 1,
    "sales_name": "山田太郎",
    "email": "yamada@example.com",
    "department": "営業1部",
    "role": "一般",
    "manager_id": 5,
    "manager_name": "佐藤花子",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### POST /sales
営業担当者作成（上長のみ）

**リクエスト**
```json
{
  "sales_name": "山田太郎",
  "email": "yamada@example.com",
  "password": "password123",
  "department": "営業1部",
  "role": "一般",
  "manager_id": 5
}
```

**バリデーション**

| フィールド | 必須 | 型 | 制約 |
|-----------|------|---|------|
| sales_name | ○ | string | 100文字以内 |
| email | ○ | string | 255文字以内、メールアドレス形式、ユニーク |
| password | ○ | string | 8文字以上 |
| department | ○ | string | 100文字以内 |
| role | ○ | string | "一般" または "上長" |
| manager_id | - | integer | 存在する営業担当者ID（role=上長のみ） |

**レスポンス（201 Created）**
```json
{
  "data": {
    "sales_id": 1,
    "sales_name": "山田太郎",
    "email": "yamada@example.com",
    "department": "営業1部",
    "role": "一般",
    "manager_id": 5,
    "manager_name": "佐藤花子",
    "created_at": "2024-01-06T10:00:00Z",
    "updated_at": "2024-01-06T10:00:00Z"
  }
}
```

**エラーレスポンス（422 Unprocessable Entity）**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "email",
        "message": "このメールアドレスは既に登録されています"
      }
    ]
  }
}
```

---

#### PUT /sales/:id
営業担当者更新（上長のみ）

**パスパラメータ**
- `id`: 営業担当者ID

**リクエスト**
```json
{
  "sales_name": "山田太郎",
  "email": "yamada@example.com",
  "department": "営業2部",
  "role": "一般",
  "manager_id": 5
}
```

**注意:** パスワードは別エンドポイントで変更

**レスポンス（200 OK）**
```json
{
  "data": {
    "sales_id": 1,
    "sales_name": "山田太郎",
    "email": "yamada@example.com",
    "department": "営業2部",
    "role": "一般",
    "manager_id": 5,
    "manager_name": "佐藤花子",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-06T11:00:00Z"
  }
}
```

---

#### DELETE /sales/:id
営業担当者削除（上長のみ）

**パスパラメータ**
- `id`: 営業担当者ID

**レスポンス（204 No Content）**
```
（レスポンスボディなし）
```

**エラーレスポンス（409 Conflict）**
```json
{
  "error": {
    "code": "SALES_IN_USE",
    "message": "この営業担当者は日報が存在するため削除できません"
  }
}
```

---

## 6. データモデル

### 6.1 Sales（営業担当者）

```json
{
  "sales_id": 1,
  "sales_name": "山田太郎",
  "email": "yamada@example.com",
  "department": "営業1部",
  "role": "一般",
  "manager_id": 5,
  "manager_name": "佐藤花子",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 6.2 Customer（顧客）

```json
{
  "customer_id": 10,
  "customer_name": "鈴木一郎",
  "company_name": "ABC株式会社",
  "industry": "IT",
  "phone": "03-1234-5678",
  "email": "suzuki@abc.co.jp",
  "address": "東京都千代田区...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 6.3 DailyReport（日報）

```json
{
  "report_id": 1,
  "sales_id": 1,
  "sales_name": "山田太郎",
  "report_date": "2024-01-06",
  "problem": "新規顧客の開拓が課題です。",
  "plan": "明日はB社へ訪問予定です。",
  "status": "提出済み",
  "submitted_at": "2024-01-06T18:30:00Z",
  "approved_at": null,
  "approved_by": null,
  "approved_by_name": null,
  "created_at": "2024-01-06T09:00:00Z",
  "updated_at": "2024-01-06T18:30:00Z"
}
```

### 6.4 Visit（訪問記録）

```json
{
  "visit_id": 1,
  "report_id": 1,
  "customer_id": 10,
  "customer_name": "鈴木一郎",
  "company_name": "ABC株式会社",
  "visit_time": "09:00:00",
  "visit_content": "新規提案の説明を実施。好感触を得た。",
  "created_at": "2024-01-06T09:00:00Z",
  "updated_at": "2024-01-06T09:00:00Z"
}
```

### 6.5 Comment（コメント）

```json
{
  "comment_id": 1,
  "report_id": 1,
  "sales_id": 5,
  "sales_name": "佐藤花子",
  "role": "上長",
  "comment_content": "良い進捗ですね。引き続き頑張ってください。",
  "created_at": "2024-01-06T19:00:00Z"
}
```

---

## 7. エラーコード一覧

### 7.1 認証関連

| エラーコード | HTTPステータス | メッセージ | 説明 |
|------------|--------------|-----------|------|
| AUTHENTICATION_FAILED | 401 | メールアドレスまたはパスワードが正しくありません | 認証失敗 |
| UNAUTHORIZED | 401 | 認証が必要です | 未ログイン |
| SESSION_EXPIRED | 401 | セッションの有効期限が切れました | セッションタイムアウト |
| CSRF_TOKEN_INVALID | 403 | CSRFトークンが無効です | CSRFトークンエラー |

### 7.2 権限関連

| エラーコード | HTTPステータス | メッセージ | 説明 |
|------------|--------------|-----------|------|
| FORBIDDEN | 403 | この操作を実行する権限がありません | 権限不足 |
| MANAGER_ONLY | 403 | この操作は上長のみ実行できます | 上長専用機能 |

### 7.3 リソース関連

| エラーコード | HTTPステータス | メッセージ | 説明 |
|------------|--------------|-----------|------|
| REPORT_NOT_FOUND | 404 | 日報が見つかりません | 日報不存在 |
| CUSTOMER_NOT_FOUND | 404 | 顧客が見つかりません | 顧客不存在 |
| SALES_NOT_FOUND | 404 | 営業担当者が見つかりません | 営業担当者不存在 |
| VISIT_NOT_FOUND | 404 | 訪問記録が見つかりません | 訪問記録不存在 |
| COMMENT_NOT_FOUND | 404 | コメントが見つかりません | コメント不存在 |

### 7.4 バリデーション関連

| エラーコード | HTTPステータス | メッセージ | 説明 |
|------------|--------------|-----------|------|
| VALIDATION_ERROR | 422 | 入力内容に誤りがあります | バリデーションエラー |
| REQUIRED_FIELD | 422 | 必須項目が入力されていません | 必須入力エラー |
| INVALID_FORMAT | 422 | 入力形式が正しくありません | 形式エラー |
| MAX_LENGTH_EXCEEDED | 422 | 最大文字数を超えています | 文字数超過 |
| INVALID_DATE | 422 | 日付の形式が正しくありません | 日付形式エラー |

### 7.5 ビジネスロジック関連

| エラーコード | HTTPステータス | メッセージ | 説明 |
|------------|--------------|-----------|------|
| REPORT_DUPLICATE | 409 | 同じ日付の日報が既に存在します | 日報重複 |
| REPORT_NOT_EDITABLE | 403 | この日報は編集できません | 編集不可 |
| REPORT_NOT_DELETABLE | 403 | この日報は削除できません | 削除不可 |
| VISIT_REQUIRED | 422 | 日報を提出するには、訪問記録を1件以上登録してください | 訪問記録必須 |
| EMAIL_ALREADY_EXISTS | 409 | このメールアドレスは既に登録されています | メール重複 |
| CUSTOMER_IN_USE | 409 | この顧客は訪問記録で使用されているため削除できません | 顧客使用中 |
| SALES_IN_USE | 409 | この営業担当者は日報が存在するため削除できません | 営業担当者使用中 |

### 7.6 システムエラー

| エラーコード | HTTPステータス | メッセージ | 説明 |
|------------|--------------|-----------|------|
| INTERNAL_SERVER_ERROR | 500 | システムエラーが発生しました | サーバーエラー |
| DATABASE_ERROR | 500 | データベースエラーが発生しました | DB接続エラー |
| SERVICE_UNAVAILABLE | 503 | サービスが一時的に利用できません | サービス停止中 |

---

## 8. レート制限

### 8.1 制限値
- 認証済みユーザー: 1000リクエスト/時間
- 未認証（ログインエンドポイントのみ）: 10リクエスト/時間

### 8.2 レート制限ヘッダー
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641456000
```

### 8.3 制限超過時のレスポンス（429 Too Many Requests）
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト数が上限を超えました。しばらく待ってから再度お試しください。"
  }
}
```

---

## 9. Webhook（将来拡張）

日報が承認された際に外部システムへ通知する機能を将来的に追加予定。

---

## 10. テスト用エンドポイント

開発環境のみ利用可能なエンドポイント。

### POST /test/reset-database
データベースを初期状態にリセット

### POST /test/seed-data
テストデータを投入

---

## 11. 改訂履歴

| 版数 | 改訂日 | 改訂内容 | 作成者 |
|------|--------|---------|--------|
| 1.0 | 2024/01/06 | 初版作成 | - |

---

## 付録A: サンプルコード

### cURLでのログイン例
```bash
curl -X POST https://api.daily-report.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### cURLでの日報一覧取得例
```bash
curl -X GET "https://api.daily-report.example.com/v1/reports?page=1&per_page=20" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### JavaScriptでのFetch API使用例
```javascript
// ログイン
const login = async (email, password) => {
  const response = await fetch('https://api.daily-report.example.com/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

// 日報一覧取得
const getReports = async () => {
  const response = await fetch('https://api.daily-report.example.com/v1/reports', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return await response.json();
};
```

---

## 付録B: ステータスコード早見表

| コード | 意味 | 主な用途 |
|-------|------|---------|
| 200 | OK | GET, PUT成功 |
| 201 | Created | POST成功（リソース作成） |
| 204 | No Content | DELETE成功 |
| 400 | Bad Request | リクエスト形式エラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限エラー |
| 404 | Not Found | リソース不存在 |
| 409 | Conflict | リソース競合 |
| 422 | Unprocessable Entity | バリデーションエラー |
| 429 | Too Many Requests | レート制限超過 |
| 500 | Internal Server Error | サーバーエラー |
| 503 | Service Unavailable | サービス停止 |
