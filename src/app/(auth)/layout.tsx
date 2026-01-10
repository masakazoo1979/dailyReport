import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン - 営業日報システム',
  description: '営業日報システムへのログイン',
};

/**
 * 認証関連ページのレイアウト
 *
 * (auth) ルートグループ配下のページに適用される
 * - ログイン画面
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
