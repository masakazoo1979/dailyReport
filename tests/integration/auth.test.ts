import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../mocks/server';

describe('認証API統合テスト', () => {
  beforeEach(() => {
    // 各テストの前にハンドラをリセット
    server.resetHandlers();
  });

  describe('POST /api/auth/login', () => {
    describe('正常系', () => {
      it('一般営業ユーザーでログインできる', async () => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'yamada@example.com',
            password: 'password',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.sales_id).toBe(1);
        expect(data.data.sales_name).toBe('山田太郎');
        expect(data.data.email).toBe('yamada@example.com');
        expect(data.data.role).toBe('一般');
      });

      it('上長ユーザーでログインできる', async () => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'sato@example.com',
            password: 'password',
          }),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.sales_id).toBe(5);
        expect(data.data.sales_name).toBe('佐藤花子');
        expect(data.data.email).toBe('sato@example.com');
        expect(data.data.role).toBe('上長');
      });
    });

    describe('異常系', () => {
      it('メールアドレスが間違っている場合、401エラーを返す', async () => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'wrong@example.com',
            password: 'password',
          }),
        });

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('AUTHENTICATION_FAILED');
        expect(data.error.message).toBe(
          'メールアドレスまたはパスワードが正しくありません'
        );
      });

      it('パスワードが間違っている場合、401エラーを返す', async () => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'yamada@example.com',
            password: 'wrongpassword',
          }),
        });

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('AUTHENTICATION_FAILED');
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('ログアウトできる', async () => {
      // 先にログイン
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yamada@example.com',
          password: 'password',
        }),
      });

      // ログアウト
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe('ログアウトしました');
    });
  });

  describe('GET /api/auth/me', () => {
    describe('正常系', () => {
      it('ログイン中のユーザー情報を取得できる', async () => {
        // 先にログイン
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'yamada@example.com',
            password: 'password',
          }),
        });

        const response = await fetch('/api/auth/me');

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
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/auth/me');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
        expect(data.error.message).toBe('認証が必要です');
      });
    });
  });

  describe('GET /api/auth/csrf-token', () => {
    describe('正常系', () => {
      it('CSRFトークンを取得できる', async () => {
        // 先にログイン
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'yamada@example.com',
            password: 'password',
          }),
        });

        const response = await fetch('/api/auth/csrf-token');

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.data).toBeDefined();
        expect(data.data.csrf_token).toBeDefined();
        expect(typeof data.data.csrf_token).toBe('string');
        expect(data.data.csrf_token.length).toBeGreaterThan(0);
      });
    });

    describe('異常系', () => {
      it('未認証の場合、401エラーを返す', async () => {
        const response = await fetch('/api/auth/csrf-token');

        expect(response.status).toBe(401);

        const data = await response.json();
        expect(data.error).toBeDefined();
        expect(data.error.code).toBe('UNAUTHORIZED');
        expect(data.error.message).toBe('認証が必要です');
      });
    });
  });
});
