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

describe('訪問記録API統合テスト', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('GET /api/reports/:report_id/visits', () => {
    describe('正常系', () => {
      it('日報の訪問記録一覧を取得できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2/visits');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);

        if (data.data.length > 0) {
          expect(data.data[0].visit_id).toBeDefined();
          expect(data.data[0].customer_name).toBeDefined();
          expect(data.data[0].company_name).toBeDefined();
          expect(data.data[0].visit_time).toBeDefined();
          expect(data.data[0].visit_content).toBeDefined();
        }
      });

      it('訪問記録がない日報の場合、空配列を返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1/visits');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.data.length).toBe(0);
      });
    });

    describe('異常系', () => {
      it('存在しない日報IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/9999/visits');

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('REPORT_NOT_FOUND');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1/visits');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('POST /api/reports/:report_id/visits', () => {
    describe('正常系', () => {
      it('訪問記録を作成できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: 10,
            visit_time: '10:00',
            visit_content: 'システムの導入提案を実施しました。',
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.visit_id).toBeDefined();
        expect(data.data.report_id).toBe(1);
        expect(data.data.customer_id).toBe(10);
        expect(data.data.customer_name).toBe('鈴木一郎');
        expect(data.data.company_name).toBe('ABC株式会社');
        expect(data.data.visit_time).toBe('10:00');
        expect(data.data.visit_content).toBe(
          'システムの導入提案を実施しました。'
        );
      });
    });

    describe('異常系', () => {
      it('存在しない顧客IDの場合、422エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: 9999,
            visit_time: '10:00',
            visit_content: '訪問内容',
          }),
        });

        expect(response.status).toBe(422);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('VALIDATION_ERROR');
        expect(data.error.details).toBeDefined();
        expect(data.error.details[0].field).toBe('customer_id');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: 10,
            visit_time: '10:00',
            visit_content: '訪問内容',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('PUT /api/visits/:id', () => {
    describe('正常系', () => {
      it('訪問記録を更新できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/visits/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visit_time: '10:30',
            visit_content: 'システムの導入提案を実施しました。好感触でした。',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.visit_id).toBe(1);
        expect(data.data.visit_time).toBe('10:30');
        expect(data.data.visit_content).toBe(
          'システムの導入提案を実施しました。好感触でした。'
        );
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/visits/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visit_time: '10:30',
            visit_content: '更新',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/visits/:id', () => {
    describe('正常系', () => {
      it('訪問記録を削除できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/visits/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(204);
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/visits/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(401);
      });
    });
  });
});
