import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logDebug,
  logInfo,
  logWarn,
  logError,
  logApiRequest,
  logAuth,
  logSecurity,
} from '@/lib/utils/logger';

describe('Logger ユーティリティ', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logDebug', () => {
    it('開発環境でデバッグログを出力する', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logDebug('Test debug message');

      expect(console.debug).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.level).toBe('debug');
      expect(logEntry.message).toBe('Test debug message');
      expect(logEntry.timestamp).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('本番環境ではデバッグログを出力しない', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logDebug('Test debug message');

      expect(console.debug).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('logInfo', () => {
    it('情報ログを出力する', () => {
      logInfo('Test info message');

      expect(console.info).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe('Test info message');
    });

    it('コンテキスト付きで情報ログを出力する', () => {
      logInfo('Test info message', { context: 'TestContext', userId: 'user1' });

      const logEntry = JSON.parse(
        (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.context).toEqual({
        context: 'TestContext',
        userId: 'user1',
      });
    });
  });

  describe('logWarn', () => {
    it('警告ログを出力する', () => {
      logWarn('Test warning message');

      expect(console.warn).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.level).toBe('warn');
      expect(logEntry.message).toBe('Test warning message');
    });
  });

  describe('logError', () => {
    it('エラーログを出力する', () => {
      const error = new Error('Test error');
      logError(error);

      expect(console.error).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.level).toBe('error');
      expect(logEntry.message).toBe('Test error');
      expect(logEntry.error).toBeDefined();
      expect(logEntry.error.name).toBe('Error');
    });

    it('コンテキスト付きでエラーログを出力する', () => {
      const error = new Error('Test error');
      logError(error, { context: 'APIHandler', method: 'POST' });

      const logEntry = JSON.parse(
        (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.context).toEqual({
        context: 'APIHandler',
        method: 'POST',
      });
    });

    it('文字列エラーを処理できる', () => {
      logError('String error message');

      const logEntry = JSON.parse(
        (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.message).toBe('String error message');
    });
  });

  describe('logApiRequest', () => {
    it('APIリクエストログを出力する', () => {
      logApiRequest('GET', '/api/reports', 200, 150, 'user1');

      expect(console.info).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.message).toBe('API GET /api/reports 200 150ms');
      expect(logEntry.context).toMatchObject({
        method: 'GET',
        url: '/api/reports',
        statusCode: 200,
        durationMs: 150,
        userId: 'user1',
      });
    });
  });

  describe('logAuth', () => {
    it('認証ログを出力する', () => {
      logAuth('login', 'user1');

      expect(console.info).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.message).toBe('Auth: login');
      expect(logEntry.context).toMatchObject({
        action: 'login',
        userId: 'user1',
      });
    });

    it('追加コンテキスト付きで認証ログを出力する', () => {
      logAuth('logout', 'user1', { ipAddress: '192.168.1.1' });

      const logEntry = JSON.parse(
        (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.context).toMatchObject({
        action: 'logout',
        userId: 'user1',
        ipAddress: '192.168.1.1',
      });
    });
  });

  describe('logSecurity', () => {
    it('セキュリティログを出力する', () => {
      logSecurity('unauthorized_access', { ip: '192.168.1.1', path: '/admin' });

      expect(console.warn).toHaveBeenCalledTimes(1);
      const logEntry = JSON.parse(
        (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0]
      );
      expect(logEntry.message).toBe('Security: unauthorized_access');
      expect(logEntry.context).toMatchObject({
        ip: '192.168.1.1',
        path: '/admin',
      });
    });
  });
});
