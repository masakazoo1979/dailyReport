import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  getClientIp,
  LOGIN_RATE_LIMIT,
  API_RATE_LIMIT,
} from '../../../src/lib/security/rate-limit';

describe('レート制限', () => {
  beforeEach(() => {
    // 各テスト前にレート制限をリセット
    resetRateLimit('test-client');
    resetRateLimit('test-client-2');
    resetRateLimit('blocked-client');
  });

  describe('checkRateLimit', () => {
    it('初回リクエストは許可される', () => {
      const result = checkRateLimit('test-client');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('制限内のリクエストは許可される', () => {
      const config = { windowMs: 60000, maxRequests: 5 };

      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('test-client', config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(5 - i - 1);
      }
    });

    it('制限を超えるとリクエストが拒否される', () => {
      const config = { windowMs: 60000, maxRequests: 3, blockDurationMs: 1000 };

      // 3回のリクエスト（制限内）
      for (let i = 0; i < 3; i++) {
        checkRateLimit('test-client-2', config);
      }

      // 4回目は拒否される
      const result = checkRateLimit('test-client-2', config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('異なる識別子は独立してカウントされる', () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      checkRateLimit('client-a', config);
      checkRateLimit('client-a', config);

      // client-aは制限に達している
      const resultA = checkRateLimit('client-a', config);
      expect(resultA.allowed).toBe(false);

      // client-bはまだ許可される
      const resultB = checkRateLimit('client-b', config);
      expect(resultB.allowed).toBe(true);

      resetRateLimit('client-a');
      resetRateLimit('client-b');
    });

    it('LOGIN_RATE_LIMITは5回まで許可する', () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(`login-test-${i}`, LOGIN_RATE_LIMIT);
        expect(result.allowed).toBe(true);
      }
    });

    it('API_RATE_LIMITは60回まで許可する', () => {
      const config = API_RATE_LIMIT;
      let allowed = 0;

      for (let i = 0; i < 60; i++) {
        const result = checkRateLimit('api-test', config);
        if (result.allowed) allowed++;
      }

      expect(allowed).toBe(60);
      resetRateLimit('api-test');
    });
  });

  describe('resetRateLimit', () => {
    it('リセット後は新しいカウントから開始する', () => {
      const config = { windowMs: 60000, maxRequests: 2, blockDurationMs: 1000 };

      checkRateLimit('reset-test', config);
      checkRateLimit('reset-test', config);
      checkRateLimit('reset-test', config);

      // ブロックされている
      expect(checkRateLimit('reset-test', config).allowed).toBe(false);

      // リセット
      resetRateLimit('reset-test');

      // 再び許可される
      expect(checkRateLimit('reset-test', config).allowed).toBe(true);

      resetRateLimit('reset-test');
    });
  });

  describe('getClientIp', () => {
    it('CF-Connecting-IPを優先する', () => {
      const headers = new Headers();
      headers.set('cf-connecting-ip', '1.2.3.4');
      headers.set('x-forwarded-for', '5.6.7.8');

      expect(getClientIp(headers)).toBe('1.2.3.4');
    });

    it('X-Forwarded-Forから最初のIPを取得する', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '1.2.3.4, 5.6.7.8, 9.10.11.12');

      expect(getClientIp(headers)).toBe('1.2.3.4');
    });

    it('X-Real-IPをフォールバックとして使用する', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '1.2.3.4');

      expect(getClientIp(headers)).toBe('1.2.3.4');
    });

    it('ヘッダーがない場合はunknownを返す', () => {
      const headers = new Headers();
      expect(getClientIp(headers)).toBe('unknown');
    });
  });
});
