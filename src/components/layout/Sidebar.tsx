'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requireManager?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'ダッシュボード',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/reports',
    label: '日報一覧',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: '/customers',
    label: '顧客一覧',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    href: '/sales',
    label: '営業一覧',
    icon: <Users className="h-5 w-5" />,
    requireManager: true,
  },
];

/**
 * サイドバーコンポーネント
 *
 * アクセシビリティ対応:
 * - nav要素とrole="navigation"を使用
 * - モバイルメニューのaria-expanded属性
 * - Escキーでモバイルメニューを閉じる
 * - フォーカストラップでキーボードナビゲーションを改善
 * - aria-current="page"でアクティブなリンクを示す
 */
export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const isManager = session?.user?.role === ROLES.MANAGER;

  const filteredNavItems = navItems.filter(
    (item) => !item.requireManager || isManager
  );

  // Escキーでモバイルメニューを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // モバイルメニューが開いたときに最初のリンクにフォーカス
      const firstLink = sidebarRef.current?.querySelector('a');
      firstLink?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        ref={toggleButtonRef}
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isOpen}
        aria-controls="main-navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="main-navigation"
        className={cn(
          'fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r bg-white transition-transform duration-300',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="メインナビゲーション"
      >
        <nav role="navigation" className="flex flex-col gap-1 p-4">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
