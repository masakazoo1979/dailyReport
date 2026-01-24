'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * ヘッダーコンポーネント
 *
 * アクセシビリティ対応:
 * - セマンティックHTMLのheader要素を使用
 * - ロゴリンクにaria-labelを付与
 * - ユーザー名表示領域にrole="status"を付与
 * - ログアウトボタンにaria-labelを付与
 */
export function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-white"
      role="banner"
    >
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 font-bold text-lg"
          aria-label="営業日報システム ホームへ戻る"
        >
          <span aria-hidden="true">営業日報システム</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <span
                className="text-sm text-muted-foreground"
                role="status"
                aria-label={`ログイン中のユーザー: ${session.user.name}`}
              >
                <span aria-hidden="true">{session.user.name}さん</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                aria-label="ログアウト"
              >
                ログアウト
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
