import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  unescapeHtml,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeObject,
  stripControlCharacters,
  escapeLikePattern,
} from '../../../src/lib/security/sanitize';

describe('XSSサニタイズ関数', () => {
  describe('escapeHtml', () => {
    it('HTMLの特殊文字をエスケープする', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('アンパサンドをエスケープする', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('シングルクォートをエスケープする', () => {
      expect(escapeHtml("It's a test")).toBe('It&#x27;s a test');
    });

    it('バッククォートをエスケープする', () => {
      expect(escapeHtml('`code`')).toBe('&#x60;code&#x60;');
    });

    it('空文字列を処理できる', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('nullやundefinedを空文字列として処理する', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
    });

    it('通常の文字列はそのまま返す', () => {
      expect(escapeHtml('Hello, World!')).toBe('Hello, World!');
    });
  });

  describe('unescapeHtml', () => {
    it('エスケープされたHTMLを元に戻す', () => {
      expect(unescapeHtml('&lt;p&gt;Hello&lt;&#x2F;p&gt;')).toBe(
        '<p>Hello</p>'
      );
    });

    it('エスケープとアンエスケープが逆操作になる', () => {
      const original = '<div class="test">Hello & Goodbye</div>';
      expect(unescapeHtml(escapeHtml(original))).toBe(original);
    });
  });

  describe('sanitizeUrl', () => {
    it('httpスキームのURLを許可する', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('httpsスキームのURLを許可する', () => {
      expect(sanitizeUrl('https://example.com/path')).toBe(
        'https://example.com/path'
      );
    });

    it('相対URLを許可する', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    });

    it('ハッシュリンクを許可する', () => {
      expect(sanitizeUrl('#section')).toBe('#section');
    });

    it('javascript:スキームを拒否する', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
    });

    it('data:スキームを拒否する', () => {
      expect(sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toBe(
        ''
      );
    });

    it('vbscript:スキームを拒否する', () => {
      expect(sanitizeUrl('vbscript:alert("xss")')).toBe('');
    });

    it('空文字列を処理できる', () => {
      expect(sanitizeUrl('')).toBe('');
    });

    it('mailtoスキームを許可する', () => {
      expect(sanitizeUrl('mailto:test@example.com')).toBe(
        'mailto:test@example.com'
      );
    });

    it('telスキームを許可する', () => {
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
    });
  });

  describe('sanitizeFilename', () => {
    it('パストラバーサル文字を削除する', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
    });

    it('バックスラッシュを削除する', () => {
      expect(sanitizeFilename('..\\..\\Windows\\System32')).toBe(
        'WindowsSystem32'
      );
    });

    it('隠しファイルの先頭ドットを削除する', () => {
      expect(sanitizeFilename('.htaccess')).toBe('htaccess');
    });

    it('Windowsの禁止文字を削除する', () => {
      expect(sanitizeFilename('file<>:"|?*.txt')).toBe('file.txt');
    });

    it('空文字列の場合はunnamedを返す', () => {
      expect(sanitizeFilename('')).toBe('unnamed');
    });

    it('通常のファイル名はそのまま返す', () => {
      expect(sanitizeFilename('document.pdf')).toBe('document.pdf');
    });

    it('日本語ファイル名を許可する', () => {
      expect(sanitizeFilename('報告書.pdf')).toBe('報告書.pdf');
    });
  });

  describe('sanitizeObject', () => {
    it('オブジェクトの文字列プロパティをトリムする', () => {
      const input = {
        name: '  John  ',
        email: 'john@example.com  ',
      };
      const result = sanitizeObject(input);
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('ネストしたオブジェクトを処理する', () => {
      const input = {
        user: {
          name: '  Jane  ',
        },
      };
      const result = sanitizeObject(input);
      expect(result.user.name).toBe('Jane');
    });

    it('数値プロパティはそのまま保持する', () => {
      const input = {
        count: 42,
        name: '  test  ',
      };
      const result = sanitizeObject(input);
      expect(result.count).toBe(42);
    });
  });

  describe('stripControlCharacters', () => {
    it('制御文字を削除する', () => {
      expect(stripControlCharacters('Hello\x00World')).toBe('HelloWorld');
    });

    it('改行は保持する', () => {
      expect(stripControlCharacters('Hello\nWorld')).toBe('Hello\nWorld');
    });

    it('タブは保持する', () => {
      expect(stripControlCharacters('Hello\tWorld')).toBe('Hello\tWorld');
    });

    it('キャリッジリターンは保持する', () => {
      expect(stripControlCharacters('Hello\rWorld')).toBe('Hello\rWorld');
    });
  });

  describe('escapeLikePattern', () => {
    it('%をエスケープする', () => {
      expect(escapeLikePattern('50%')).toBe('50\\%');
    });

    it('_をエスケープする', () => {
      expect(escapeLikePattern('user_name')).toBe('user\\_name');
    });

    it('バックスラッシュをエスケープする', () => {
      expect(escapeLikePattern('C:\\path')).toBe('C:\\\\path');
    });

    it('複合パターンをエスケープする', () => {
      expect(escapeLikePattern('100% user_data')).toBe('100\\% user\\_data');
    });
  });
});
