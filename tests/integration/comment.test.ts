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

describe('コメントAPI統合テスト', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('GET /api/reports/:report_id/comments', () => {
    describe('正常系', () => {
      it('日報のコメント一覧を取得できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2/comments');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);

        if (data.data.length > 0) {
          expect(data.data[0].comment_id).toBeDefined();
          expect(data.data[0].sales_id).toBeDefined();
          expect(data.data[0].sales_name).toBeDefined();
          expect(data.data[0].role).toBeDefined();
          expect(data.data[0].comment_content).toBeDefined();
          expect(data.data[0].created_at).toBeDefined();
        }
      });

      it('コメントがない日報の場合、空配列を返す', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/1/comments');

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

        const response = await fetch('/api/reports/9999/comments');

        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('REPORT_NOT_FOUND');
      });

      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1/comments');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
      });
    });
  });

  describe('POST /api/reports/:report_id/comments', () => {
    describe('正常系', () => {
      it('一般営業がコメントを投稿できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/reports/2/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment_content: 'ご確認をお願いします。',
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.comment_id).toBeDefined();
        expect(data.data.report_id).toBe(2);
        expect(data.data.sales_id).toBe(1);
        expect(data.data.sales_name).toBe('山田太郎');
        expect(data.data.role).toBe('一般');
        expect(data.data.comment_content).toBe('ご確認をお願いします。');
        expect(data.data.created_at).toBeDefined();
      });

      it('上長がコメントを投稿できる', async () => {
        await loginAsManager();

        const response = await fetch('/api/reports/2/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment_content: '良い進捗ですね。',
          }),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.comment_id).toBeDefined();
        expect(data.data.sales_id).toBe(5);
        expect(data.data.sales_name).toBe('佐藤花子');
        expect(data.data.role).toBe('上長');
        expect(data.data.comment_content).toBe('良い進捗ですね。');
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/reports/1/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comment_content: 'コメント',
          }),
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('DELETE /api/comments/:id', () => {
    describe('正常系', () => {
      it('コメントを削除できる', async () => {
        await loginAsSales();

        const response = await fetch('/api/comments/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(204);
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/comments/1', {
          method: 'DELETE',
        });

        expect(response.status).toBe(401);
      });
    });
  });
});
