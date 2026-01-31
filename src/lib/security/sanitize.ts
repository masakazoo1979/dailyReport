/**
 * XSS対策のためのサニタイズユーティリティ
 *
 * ユーザー入力を安全に処理するための関数群
 */

// HTMLエンティティのエスケープマップ
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

// HTMLエンティティのアンエスケープマップ
const HTML_UNESCAPE_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#x2F;': '/',
  '&#x60;': '`',
  '&#x3D;': '=',
  '&#39;': "'",
};

/**
 * HTMLの特殊文字をエスケープする
 * XSS攻撃を防ぐための基本的なサニタイズ
 *
 * @param str - エスケープする文字列
 * @returns エスケープされた文字列
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * エスケープされたHTMLをデコードする
 * データベースからの読み取り時に使用
 *
 * @param str - デコードする文字列
 * @returns デコードされた文字列
 */
export function unescapeHtml(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(
    /&(amp|lt|gt|quot|#x27|#x2F|#x60|#x3D|#39);/g,
    (match) => HTML_UNESCAPE_MAP[match] || match
  );
}

/**
 * URLをサニタイズする
 * javascript: や data: スキームを防ぐ
 *
 * @param url - サニタイズするURL
 * @returns 安全なURL、または無効な場合は空文字列
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // 空白を除去してから検証
  const trimmedUrl = url.trim().toLowerCase();

  // 許可されるスキーム
  const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];

  // 相対URLは許可
  if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('#')) {
    return url.trim();
  }

  // スキームをチェック
  try {
    const urlObj = new URL(url);
    if (allowedSchemes.some((scheme) => urlObj.protocol === scheme)) {
      return url;
    }
  } catch {
    // 相対パスの場合はそのまま返す
    if (!trimmedUrl.includes(':')) {
      return url.trim();
    }
  }

  return '';
}

/**
 * ファイル名をサニタイズする
 * ディレクトリトラバーサル攻撃を防ぐ
 *
 * @param filename - サニタイズするファイル名
 * @returns 安全なファイル名
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed';
  }

  // パストラバーサル文字を削除
  let sanitized = filename.replace(/[/\\]/g, '');

  // 隠しファイル（.で始まる）を防ぐ
  sanitized = sanitized.replace(/^\.+/, '');

  // 制御文字を削除
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');

  // 危険な文字を削除
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');

  return sanitized.trim() || 'unnamed';
}

/**
 * オブジェクトの全ての文字列プロパティをサニタイズする
 *
 * @param obj - サニタイズするオブジェクト
 * @returns サニタイズされたオブジェクト
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key];

      if (typeof value === 'string') {
        // 文字列は基本的にそのまま（Reactが自動エスケープするため）
        // 明示的にHTMLとして使用する場合のみescapeHtmlを使用
        (result as Record<string, unknown>)[key] = value.trim();
      } else if (value !== null && typeof value === 'object') {
        (result as Record<string, unknown>)[key] = sanitizeObject(
          value as Record<string, unknown>
        );
      }
    }
  }

  return result;
}

/**
 * 入力文字列から制御文字を除去する
 *
 * @param str - 処理する文字列
 * @returns 制御文字が除去された文字列
 */
export function stripControlCharacters(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  // 改行とタブは許可、その他の制御文字を削除
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * SQLのLIKE句で使用する特殊文字をエスケープする
 *
 * @param str - エスケープする文字列
 * @returns エスケープされた文字列
 */
export function escapeLikePattern(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.replace(/[%_\\]/g, '\\$&');
}
