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

describe('営業担当者API統合テスト', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('GET /api/sales', () => {
    describe('正常系', () => {
      it('上長は営業担当者一覧を取得できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/sales');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.pagination).toBeDefined();

        if (data.data.length > 0) {
          expect(data.data[0].sales_id).toBeDefined();
          expect(data.data[0].sales_name).toBeDefined();
          expect(data.data[0].email).toBeDefined();
          expect(data.data[0].department).toBeDefined();
          expect(data.data[0].role).toBeDefined();
        }
      });
    });

    describe('異常系', () => {
      it('一般営業はアクセスできない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/sales');

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('FORBIDDEN');
        expect(data.error.message).toBe('この操作を実行する権限がありません');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/sales');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('GET /api/sales/:id', () => {
    describe('正常系', () => {
      it('営業担当者の詳細を取得できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/sales/1');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.sales_id).toBe(1);
        expect(data.data.sales_name).toBe('山田太郎');
        expect(data.data.email).toBe('yamada@example.com');
        expect(data.data.department).toBe('営業1部');
        expect(data.data.role).toBe('一般');
      });
    });

    describe('異常系', () => {
      it('存在しない営業担当者IDの場合、404エラーを返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/sales/9999');

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('SALES_NOT_FOUND');
        expect(data.error.message).toBe('営業担当者が見つかりません');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/sales/1');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('POST /api/sales', () => {
    describe('正常系', () => {
      it('上長は新しい営業担当者を作成できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sales_name: '伊藤五郎',
            email: 'ito@example.com',
            department: '営業2部',
            role: '一般',
            manager_id: 5,
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.sales_id).toBeDefined();
        expect(data.data.sales_name).toBe('伊藤五郎');
        expect(data.data.email).toBe('ito@example.com');
        expect(data.data.department).toBe('営業2部');
        expect(data.data.role).toBe('一般');
        expect(data.data.manager_id).toBe(5);
        expect(data.data.is_active).toBe(true);
      });
    });

    describe('異常系', () => {
      it('一般営業は営業担当者を作成できない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sales_name: 'テスト',
            email: 'test@example.com',
            department: '営業1部',
            role: '一般',
          }),
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('FORBIDDEN');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sales_name: 'テスト',
            email: 'test@example.com',
            department: '営業1部',
            role: '一般',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('PUT /api/sales/:id', () => {
    describe('正常系', () => {
      it('上長は営業担当者情報を更新できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/sales/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: '営業3部',
            role: 'リーダー',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.sales_id).toBe(1);
        expect(data.data.department).toBe('営業3部');
        expect(data.data.role).toBe('リーダー');
      });
    });

    describe('異常系', () => {
      it('一般営業は営業担当者を更新できない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/sales/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: '営業3部',
          }),
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('FORBIDDEN');
      });

      it('存在しない営業担当者IDの場合、404エラーを返す', async () => {
        await loginAsManager();

        const response = await fetch('/api/sales/9999', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: '営業3部',
          }),
        });

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('SALES_NOT_FOUND');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/sales/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: '営業3部',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/sales/:id', () => {
    describe('正常系', () => {
      it('上長は営業担当者を削除できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/sales/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(204);
      });
    });

    describe('異常系', () => {
      it('一般営業は営業担当者を削除できない（403エラー）', async () => {
        await loginAsSales();

        const response = await fetch('/api/sales/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(403);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('FORBIDDEN');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/sales/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(401);
      });
    });
  });
});
