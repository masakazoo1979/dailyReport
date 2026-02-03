import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('環境変数バリデーション', () => {
  // 環境変数スキーマを直接テスト（モジュールの再読み込みを避けるため）
  const serverEnvSchema = z.object({
    DATABASE_URL: z
      .string()
      .url('DATABASE_URLは有効なURLである必要があります')
      .refine(
        (url) =>
          url.startsWith('postgresql://') || url.startsWith('postgres://'),
        'DATABASE_URLはPostgreSQLの接続文字列である必要があります'
      ),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    NEXTAUTH_URL: z
      .string()
      .url('NEXTAUTH_URLは有効なURLである必要があります')
      .optional(),
    NEXTAUTH_SECRET: z
      .string()
      .min(32, 'NEXTAUTH_SECRETは32文字以上である必要があります'),
    CI: z.string().optional(),
  });

  describe('DATABASE_URL', () => {
    it('有効なPostgreSQL URLを受け入れる', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
    });

    it('postgres://スキームも受け入れる', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
    });

    it('非PostgreSQL URLを拒否する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(false);
    });

    it('無効なURLを拒否する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'not-a-valid-url',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('NODE_ENV', () => {
    it('development, production, testを受け入れる', () => {
      const envs = ['development', 'production', 'test'];
      for (const env of envs) {
        const result = serverEnvSchema.safeParse({
          DATABASE_URL: 'postgresql://localhost/db',
          NODE_ENV: env,
          NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
        });
        expect(result.success).toBe(true);
      }
    });

    it('無効な値を拒否する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NODE_ENV: 'staging',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(false);
    });

    it('未設定の場合はdevelopmentにデフォルト', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('development');
      }
    });
  });

  describe('PORT', () => {
    it('有効なポート番号を受け入れる', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        PORT: '8080',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(8080);
      }
    });

    it('文字列を数値に変換する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        PORT: '3000',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.PORT).toBe('number');
      }
    });

    it('未設定の場合は3000にデフォルト', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(3000);
      }
    });
  });

  describe('NEXTAUTH_SECRET', () => {
    it('32文字以上のシークレットを受け入れる', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NEXTAUTH_SECRET: 'this-is-exactly-32-characters!!!',
      });
      expect(result.success).toBe(true);
    });

    it('31文字以下のシークレットを拒否する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NEXTAUTH_SECRET: 'too-short',
      });
      expect(result.success).toBe(false);
    });

    it('必須フィールドとして検証する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('NEXTAUTH_URL', () => {
    it('有効なURLを受け入れる', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NEXTAUTH_URL: 'https://example.com',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
    });

    it('オプションフィールドとして許可する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(true);
    });

    it('無効なURLを拒否する', () => {
      const result = serverEnvSchema.safeParse({
        DATABASE_URL: 'postgresql://localhost/db',
        NEXTAUTH_URL: 'not-a-url',
        NEXTAUTH_SECRET: 'this-is-a-very-long-secret-key-32chars',
      });
      expect(result.success).toBe(false);
    });
  });
});
