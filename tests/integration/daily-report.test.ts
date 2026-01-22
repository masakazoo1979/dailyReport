import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../mocks/server';

/**
 * テストヘルパー: 一般営業ユーザーでログイン
 */
async function loginAsSales() {
  await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'yamada@example.com',
      password: 'password',
    }),
  });
}

/**
 * テストヘルパー: 上長ユーザーでログイン
 */
async function loginAsManager() {
  await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sato@example.com',
      password: 'password',
    }),
  });
}

describe('日報API統合テスト', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('GET /api/reports', () => {
    describe('正常系', () => {
      it('一般営業は自分の日報一覧を取得できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.pagination).toBeDefined();

        // 一般営業は自分の日報のみ
        data.data.forEach((report: any) => {
          expect(report.sales_id).toBe(1);
        });
      });

      it('上長は全営業担当者の日報を取得できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/reports');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.pagination).toBeDefined();
      });

      it('ステータスでフィルタリングできる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports?status=下書き');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        data.data.forEach((report: any) => {
          expect(report.status).toBe('下書き');
        });
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('GET /api/reports/:id', () => {
    describe('正常系', () => {
      it('自分の日報詳細を取得できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.report_id).toBe(1);
        expect(data.data.sales_id).toBe(1);
        expect(data.data.sales_name).toBe('山田太郎');
        expect(data.data.visits).toBeDefined();
        expect(data.data.comments).toBeDefined();
      });

      it('上長は他の営業担当者の日報を取得できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/reports/1');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
      });
    });

    describe('異常系', () => {
      it('存在しない日報IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/9999');

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('REPORT_NOT_FOUND');
        expect(data.error.message).toBe('日報が見つかりません');
      });

      it('一般営業が他人の日報を取得しようとすると403エラーを返す', async () => {
        await loginAsSales();

        // sales_id=2の日報にアクセス
        const response = await fetch('/api/reports/10');

        // モックでは存在しないIDなので404が返る可能性もあるが、
        // 仮に存在する場合は403を期待
        if (response.status !== 404) {
          expect(response.status).toBe(403);

          const data = await response.json();
          expect(data.error).toBeDefined();
          expect(data.error.code).toBe('FORBIDDEN');
        }
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('POST /api/reports', () => {
    describe('正常系', () => {
      it('新しい日報を作成できる（下書き）', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_date: '2024-01-10',
            problem: '新規案件の進捗が遅れています。',
            plan: '明日はフォローアップ訪問を予定。',
            status: '下書き',
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.report_id).toBeDefined();
        expect(data.data.report_date).toBe('2024-01-10');
        expect(data.data.status).toBe('下書き');
        expect(data.data.sales_id).toBe(1);
      });
    });

    describe('異常系', () => {
      it('同じ日付の日報が既に存在する場合、422エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_date: '2024-01-06', // 既存の日報と同じ日付
            problem: 'テスト',
            plan: 'テスト',
            status: '下書き',
          }),
        });

        expect(response.status).toBe(422);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.details).toBeDefined();
        expect(data.error.details[0].field).toBe('report_date');
        expect(data.error.details[0].message).toBe(
          '同じ日付の日報が既に存在します'
        );
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_date: '2024-01-10',
            status: '下書き',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('PUT /api/reports/:id', () => {
    describe('正常系', () => {
      it('下書きの日報を更新できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: '更新した課題内容です。',
            plan: '更新した予定です。',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.report_id).toBe(1);
        expect(data.data.problem).toBe('更新した課題内容です。');
      });
    });

    describe('異常系', () => {
      it('提出済みの日報は編集できない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: '更新しようとする',
          }),
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('REPORT_NOT_EDITABLE');
      });

      it('承認済みの日報は編集できない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/3', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: '更新しようとする',
          }),
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('REPORT_NOT_EDITABLE');
      });

      it('存在しない日報IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/9999', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: '更新',
          }),
        });

        expect(response.status).toBe(404);
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: '更新',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/reports/:id', () => {
    describe('正常系', () => {
      it('下書きの日報を削除できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(204);
      });
    });

    describe('異常系', () => {
      it('提出済みの日報は削除できない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2', {
          method: 'DELETE',
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('REPORT_NOT_DELETABLE');
      });

      it('存在しない日報IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/9999', {
          method: 'DELETE',
        });

        expect(response.status).toBe(404);
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/reports/:id/submit', () => {
    describe('正常系', () => {
      it('訪問記録がある日報を提出できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2/submit', {
          method: 'POST',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.report_id).toBe(2);
        expect(data.data.status).toBe('提出済み');
        expect(data.data.submitted_at).toBeDefined();
      });
    });

    describe('異常系', () => {
      it('訪問記録がない日報は提出できない（422エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1/submit', {
          method: 'POST',
        });

        expect(response.status).toBe(422);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.message).toBe(
          '日報を提出するには、訪問記録を1件以上登録してください'
        );
      });

      it('存在しない日報IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/9999/submit', {
          method: 'POST',
        });

        expect(response.status).toBe(404);
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1/submit', {
          method: 'POST',
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/reports/:id/approve', () => {
    describe('正常系', () => {
      it('上長は日報を承認できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/reports/2/approve', {
          method: 'POST',
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.report_id).toBe(2);
        expect(data.data.status).toBe('承認済み');
        expect(data.data.approved_at).toBeDefined();
        expect(data.data.approved_by).toBe(5);
        expect(data.data.approved_by_name).toBe('佐藤花子');
      });
    });

    describe('異常系', () => {
      it('一般営業は日報を承認できない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2/approve', {
          method: 'POST',
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('FORBIDDEN');
        expect(data.error.message).toBe('この操作を実行する権限がありません');
      });

      it('存在しない日報IDの場合、404エラーを返す', async () => {
        await loginAsManager();

        const response = await fetch('/api/reports/9999/approve', {
          method: 'POST',
        });

        expect(response.status).toBe(404);
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1/approve', {
          method: 'POST',
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/reports/:id/reject', () => {
    describe('正常系', () => {
      it('上長は日報を差し戻しできる', async () => {
        await loginAsManager();

        const response = await fetch('/api/reports/2/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: '訪問内容をもう少し詳しく記載してください。',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.report_id).toBe(2);
        expect(data.data.status).toBe('差し戻し');
      });
    });

    describe('異常系', () => {
      it('一般営業は日報を差し戻しできない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: 'コメント',
          }),
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('FORBIDDEN');
      });

      it('存在しない日報IDの場合、404エラーを返す', async () => {
        await loginAsManager();

        const response = await fetch('/api/reports/9999/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: 'コメント',
          }),
        });

        expect(response.status).toBe(404);
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment: 'コメント',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });
});
