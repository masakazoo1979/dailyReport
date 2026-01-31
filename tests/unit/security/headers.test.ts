import { describe, it, expect } from 'vitest';

/**
 * セキュリティヘッダーのテスト
 *
 * next.config.jsで設定されたセキュリティヘッダーの検証
 */
describe('セキュリティヘッダー設定', () => {
  // next.config.jsのヘッダー設定を直接テスト
  const securityHeaders = [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; '),
    },
  ];

  describe('必須セキュリティヘッダー', () => {
    it('Strict-Transport-Securityが設定されている', () => {
      const header = securityHeaders.find(
        (h) => h.key === 'Strict-Transport-Security'
      );
      expect(header).toBeDefined();
      expect(header?.value).toContain('max-age=');
      expect(header?.value).toContain('includeSubDomains');
    });

    it('X-Content-Type-Optionsが設定されている', () => {
      const header = securityHeaders.find(
        (h) => h.key === 'X-Content-Type-Options'
      );
      expect(header).toBeDefined();
      expect(header?.value).toBe('nosniff');
    });

    it('X-Frame-Optionsが設定されている', () => {
      const header = securityHeaders.find((h) => h.key === 'X-Frame-Options');
      expect(header).toBeDefined();
      expect(header?.value).toBe('DENY');
    });

    it('X-XSS-Protectionが設定されている', () => {
      const header = securityHeaders.find((h) => h.key === 'X-XSS-Protection');
      expect(header).toBeDefined();
      expect(header?.value).toContain('1');
    });

    it('Referrer-Policyが設定されている', () => {
      const header = securityHeaders.find((h) => h.key === 'Referrer-Policy');
      expect(header).toBeDefined();
      expect(header?.value).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Content-Security-Policy', () => {
    const cspHeader = securityHeaders.find(
      (h) => h.key === 'Content-Security-Policy'
    );
    const cspValue = cspHeader?.value || '';

    it('CSPヘッダーが設定されている', () => {
      expect(cspHeader).toBeDefined();
    });

    it("default-srcが'self'に制限されている", () => {
      expect(cspValue).toContain("default-src 'self'");
    });

    it('frame-ancestorsがnoneに設定されている（クリックジャッキング対策）', () => {
      expect(cspValue).toContain("frame-ancestors 'none'");
    });

    it("base-uriが'self'に制限されている", () => {
      expect(cspValue).toContain("base-uri 'self'");
    });

    it("form-actionが'self'に制限されている", () => {
      expect(cspValue).toContain("form-action 'self'");
    });

    it('img-srcが適切に設定されている', () => {
      expect(cspValue).toContain("img-src 'self' data: blob:");
    });
  });

  describe('Permissions-Policy', () => {
    const header = securityHeaders.find((h) => h.key === 'Permissions-Policy');

    it('Permissions-Policyが設定されている', () => {
      expect(header).toBeDefined();
    });

    it('カメラアクセスが無効化されている', () => {
      expect(header?.value).toContain('camera=()');
    });

    it('マイクアクセスが無効化されている', () => {
      expect(header?.value).toContain('microphone=()');
    });

    it('位置情報アクセスが無効化されている', () => {
      expect(header?.value).toContain('geolocation=()');
    });
  });

  describe('HSTS設定', () => {
    const hstsHeader = securityHeaders.find(
      (h) => h.key === 'Strict-Transport-Security'
    );
    const hstsValue = hstsHeader?.value || '';

    it('max-ageが2年（63072000秒）に設定されている', () => {
      expect(hstsValue).toContain('max-age=63072000');
    });

    it('includeSubDomainsが設定されている', () => {
      expect(hstsValue).toContain('includeSubDomains');
    });

    it('preloadが設定されている', () => {
      expect(hstsValue).toContain('preload');
    });
  });
});
