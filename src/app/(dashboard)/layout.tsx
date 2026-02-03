import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SessionProvider } from '@/components/providers';
import { MainLayout } from '@/components/layout';

/**
 * ダッシュボードレイアウト
 *
 * - ミドルウェアで認証チェック済みだが、二重チェックとしてサーバーサイドでもセッション検証
 * - 未認証時はログインページへリダイレクト
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // サーバーサイドでセッションを取得
  const session = await getServerSession(authOptions);

  // ミドルウェアでチェック済みだが、二重チェックとして未認証ならリダイレクト
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <SessionProvider>
      <MainLayout>{children}</MainLayout>
    </SessionProvider>
  );
}
