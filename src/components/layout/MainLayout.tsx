'use client';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * メインレイアウトコンポーネント
 *
 * セマンティックHTMLとARIA属性を使用してアクセシビリティを確保
 * - header: ページヘッダー
 * - nav: ナビゲーション（サイドバー）
 * - main: メインコンテンツ領域
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main id="main-content" className="md:pl-64" role="main">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
