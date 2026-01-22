import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  DuplicateError,
  fromZodError,
  getErrorMessage,
  getErrorStatusCode,
  getErrorCode,
  formatErrorForLog,
  isRetryableError,
  toUserFriendlyMessage,
} from '@/lib/utils/error';

describe('エラーハンドリング関数', () => {
  describe('AppError', () => {
    it('カスタムメッセージとステータスコードを持つ', () => {
      const error = new AppError('カスタムエラー', 400, 'CUSTOM_ERROR');
      expect(error.message).toBe('カスタムエラー');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_ERROR');
    });

    it('デフォルト値を持つ', () => {
      const error = new AppError('エラー');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('AuthenticationError', () => {
    it('401ステータスコードを持つ', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('カスタムメッセージを指定できる', () => {
      const error = new AuthenticationError('セッションが切れました');
      expect(error.message).toBe('セッションが切れました');
    });
  });

  describe('AuthorizationError', () => {
    it('403ステータスコードを持つ', () => {
      const error = new AuthorizationError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('NotFoundError', () => {
    it('404ステータスコードを持つ', () => {
      const error = new NotFoundError('日報');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('日報が見つかりません');
    });
  });

  describe('ValidationError', () => {
    it('400ステータスコードを持つ', () => {
      const error = new ValidationError();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('エラー詳細を持てる', () => {
      const errors = {
        email: ['メールアドレスを入力してください'],
        password: ['パスワードを入力してください'],
      };
      const error = new ValidationError('バリデーションエラー', errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('DuplicateError', () => {
    it('409ステータスコードを持つ', () => {
      const error = new DuplicateError();
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('DUPLICATE');
    });
  });

  describe('fromZodError', () => {
    it('ZodエラーをValidationErrorに変換できる', () => {
      const schema = z.object({
        email: z.string().email('メールアドレスが無効です'),
        password: z.string().min(8, '8文字以上必要です'),
      });

      try {
        schema.parse({ email: 'invalid', password: '123' });
      } catch (e) {
        if (e instanceof z.ZodError) {
          const validationError = fromZodError(e);
          expect(validationError).toBeInstanceOf(ValidationError);
          expect(validationError.errors.email).toContain(
            'メールアドレスが無効です'
          );
          expect(validationError.errors.password).toContain(
            '8文字以上必要です'
          );
        }
      }
    });
  });

  describe('getErrorMessage', () => {
    it('AppErrorからメッセージを取得できる', () => {
      const error = new AppError('テストエラー');
      expect(getErrorMessage(error)).toBe('テストエラー');
    });

    it('ZodErrorから最初のメッセージを取得できる', () => {
      const schema = z.string().min(1, '入力必須です');
      try {
        schema.parse('');
      } catch (e) {
        if (e instanceof z.ZodError) {
          expect(getErrorMessage(e)).toBe('入力必須です');
        }
      }
    });

    it('通常のErrorからメッセージを取得できる', () => {
      const error = new Error('通常のエラー');
      expect(getErrorMessage(error)).toBe('通常のエラー');
    });

    it('不明なエラーの場合デフォルトメッセージを返す', () => {
      expect(getErrorMessage(null)).toBe('予期しないエラーが発生しました');
    });
  });

  describe('getErrorStatusCode', () => {
    it('AppErrorからステータスコードを取得できる', () => {
      expect(getErrorStatusCode(new AuthenticationError())).toBe(401);
      expect(getErrorStatusCode(new NotFoundError())).toBe(404);
    });

    it('ZodErrorの場合400を返す', () => {
      const schema = z.string();
      try {
        schema.parse(123);
      } catch (e) {
        expect(getErrorStatusCode(e)).toBe(400);
      }
    });

    it('不明なエラーの場合500を返す', () => {
      expect(getErrorStatusCode(new Error())).toBe(500);
    });
  });

  describe('getErrorCode', () => {
    it('AppErrorからコードを取得できる', () => {
      expect(getErrorCode(new AuthenticationError())).toBe(
        'AUTHENTICATION_REQUIRED'
      );
    });

    it('ZodErrorの場合VALIDATION_ERRORを返す', () => {
      const schema = z.string();
      try {
        schema.parse(123);
      } catch (e) {
        expect(getErrorCode(e)).toBe('VALIDATION_ERROR');
      }
    });

    it('不明なエラーの場合INTERNAL_ERRORを返す', () => {
      expect(getErrorCode(new Error())).toBe('INTERNAL_ERROR');
    });
  });

  describe('formatErrorForLog', () => {
    it('AppErrorをログ用にフォーマットできる', () => {
      const error = new AppError('テスト', 400, 'TEST');
      const formatted = formatErrorForLog(error);
      expect(formatted.name).toBe('AppError');
      expect(formatted.message).toBe('テスト');
      expect(formatted.code).toBe('TEST');
      expect(formatted.statusCode).toBe(400);
    });

    it('ZodErrorをログ用にフォーマットできる', () => {
      const schema = z.string();
      try {
        schema.parse(123);
      } catch (e) {
        const formatted = formatErrorForLog(e);
        expect(formatted.name).toBe('ZodError');
      }
    });
  });

  describe('isRetryableError', () => {
    it('5xxエラーは再試行可能', () => {
      expect(isRetryableError(new AppError('Server Error', 500))).toBe(true);
      expect(isRetryableError(new AppError('Bad Gateway', 502))).toBe(true);
    });

    it('4xxエラーは再試行不可', () => {
      expect(isRetryableError(new AuthenticationError())).toBe(false);
      expect(isRetryableError(new NotFoundError())).toBe(false);
    });

    it('不明なエラーは再試行不可', () => {
      expect(isRetryableError(new Error())).toBe(false);
    });
  });

  describe('toUserFriendlyMessage', () => {
    it('AuthenticationErrorの場合ユーザー向けメッセージを返す', () => {
      const message = toUserFriendlyMessage(new AuthenticationError());
      expect(message).toContain('ログイン');
    });

    it('AuthorizationErrorの場合ユーザー向けメッセージを返す', () => {
      const message = toUserFriendlyMessage(new AuthorizationError());
      expect(message).toContain('権限');
    });

    it('NotFoundErrorの場合エラーメッセージをそのまま返す', () => {
      const message = toUserFriendlyMessage(new NotFoundError('日報'));
      expect(message).toBe('日報が見つかりません');
    });

    it('不明なエラーの場合汎用メッセージを返す', () => {
      const message = toUserFriendlyMessage(new Error('Unknown'));
      expect(message).toContain('エラーが発生しました');
    });
  });
});
