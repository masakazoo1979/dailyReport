# 営業日報システム ER図

```mermaid
erDiagram
    Sales ||--o{ DailyReport : "作成する"
    Sales ||--o{ Comment : "投稿する"
    DailyReport ||--o{ Visit : "含む"
    DailyReport ||--o{ Comment : "受ける"
    Customer ||--o{ Visit : "訪問される"

    Sales {
        int sales_id PK "営業ID"
        string sales_name "営業担当者名"
        string email "メールアドレス"
        string department "所属部署"
        string role "役割(一般/上長)"
        int manager_id FK "上長ID"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    Customer {
        int customer_id PK "顧客ID"
        string customer_name "顧客担当者名"
        string company_name "会社名"
        string industry "業種"
        string phone "電話番号"
        string email "メールアドレス"
        string address "住所"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    DailyReport {
        int report_id PK "日報ID"
        int sales_id FK "営業ID"
        date report_date "報告日"
        text problem "課題・相談"
        text plan "明日の予定"
        string status "ステータス"
        datetime submitted_at "提出日時"
        datetime approved_at "承認日時"
        int approved_by FK "承認者ID"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    Visit {
        int visit_id PK "訪問ID"
        int report_id FK "日報ID"
        int customer_id FK "顧客ID"
        text visit_content "訪問内容"
        time visit_time "訪問時刻"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    Comment {
        int comment_id PK "コメントID"
        int report_id FK "日報ID"
        int sales_id FK "投稿者ID"
        text comment_content "コメント内容"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }
```

## テーブル説明

### Sales（営業マスタ）

営業担当者の基本情報を管理。role で一般営業と上長を区別。

### Customer（顧客マスタ）

訪問先顧客の情報を管理。

### DailyReport（日報）

1営業担当者が1日1件作成。Problem（課題・相談）とPlan（明日の予定）を記録。
ステータス: '下書き', '提出済み', '承認済み', '差し戻し'

### Visit（訪問記録）

1つの日報に複数の訪問記録を紐付け。訪問内容を詳細に記録。

### Comment（コメント）

上長や営業担当者が日報に対してフィードバック。複数コメント可能。
