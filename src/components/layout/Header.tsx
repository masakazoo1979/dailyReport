'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 font-bold text-lg"
        >
          <span>営業日報システム</span>
        </Link>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.name}さん
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                ログアウト
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
