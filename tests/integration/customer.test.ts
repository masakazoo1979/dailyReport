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

describe('顧客API統合テスト', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('GET /api/customers', () => {
    describe('正常系', () => {
      it('顧客一覧を取得できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.pagination).toBeDefined();

        if (data.data.length > 0) {
          expect(data.data[0].customer_id).toBeDefined();
          expect(data.data[0].customer_name).toBeDefined();
          expect(data.data[0].company_name).toBeDefined();
          expect(data.data[0].email).toBeDefined();
          expect(data.data[0].phone).toBeDefined();
        }
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/customers');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('GET /api/customers/:id', () => {
    describe('正常系', () => {
      it('顧客詳細を取得できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers/10');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.customer_id).toBe(10);
        expect(data.data.customer_name).toBe('鈴木一郎');
        expect(data.data.company_name).toBe('ABC株式会社');
        expect(data.data.department).toBe('営業部');
        expect(data.data.position).toBe('部長');
        expect(data.data.email).toBe('suzuki@abc.co.jp');
        expect(data.data.phone).toBe('03-1234-5678');
      });
    });

    describe('異常系', () => {
      it('存在しない顧客IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers/9999');

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('CUSTOMER_NOT_FOUND');
        expect(data.error.message).toBe('顧客が見つかりません');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/customers/10');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/customers', () => {
    describe('正常系', () => {
      it('新しい顧客を作成できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: '高橋三郎',
            company_name: 'DEF商事株式会社',
            department: '経営企画部',
            position: '部長',
            email: 'takahashi@def.co.jp',
            phone: '03-5555-6666',
            address: '東京都渋谷区',
            industry: 'コンサルティング',
            notes: '重要顧客候補',
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.customer_id).toBeDefined();
        expect(data.data.customer_name).toBe('高橋三郎');
        expect(data.data.company_name).toBe('DEF商事株式会社');
        expect(data.data.email).toBe('takahashi@def.co.jp');
        expect(data.data.is_active).toBe(true);
      });

      it('必須項目のみで顧客を作成できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: '佐々木四郎',
            company_name: 'GHI株式会社',
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.customer_name).toBe('佐々木四郎');
        expect(data.data.company_name).toBe('GHI株式会社');
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: 'テスト',
            company_name: 'テスト株式会社',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('PUT /api/customers/:id', () => {
    describe('正常系', () => {
      it('顧客情報を更新できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers/10', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: '執行役員',
            phone: '03-1234-9999',
            notes: '重要顧客',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.customer_id).toBe(10);
        expect(data.data.position).toBe('執行役員');
        expect(data.data.phone).toBe('03-1234-9999');
        expect(data.data.notes).toBe('重要顧客');
      });
    });

    describe('異常系', () => {
      it('存在しない顧客IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers/9999', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: '課長',
          }),
        });

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('CUSTOMER_NOT_FOUND');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/customers/10', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: '課長',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/customers/:id', () => {
    describe('正常系', () => {
      it('顧客を削除できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/customers/10', {
          method: 'DELETE',
        });

        expect(response.status).toBe(204);
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/customers/10', {
          method: 'DELETE',
        });

        expect(response.status).toBe(401);
      });
    });
  });
});
