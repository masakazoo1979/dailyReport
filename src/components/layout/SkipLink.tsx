'use client';

/**
 * スキップリンクコンポーネント
 *
 * キーボードナビゲーションユーザーがメインコンテンツに直接ジャンプできるようにする
 * WCAG 2.1 AA準拠のアクセシビリティ対応
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      メインコンテンツへスキップ
    </a>
  );
}
