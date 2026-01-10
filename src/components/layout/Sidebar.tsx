'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNavigationItemsForRole } from '@/lib/navigation';
import { UserRole } from '@/types';

export interface SidebarProps {
  /** User role for filtering menu items */
  userRole: UserRole;
  /** Optional className for styling */
  className?: string;
  /** Callback when navigation item is clicked (useful for mobile) */
  onNavigate?: () => void;
}

/**
 * Sidebar Component
 *
 * Displays the navigation sidebar with:
 * - Role-based menu items (一般営業 vs 上長)
 * - Active menu highlighting
 * - Responsive design
 *
 * Based on doc/screen-specification.md section 6.2 and navigation requirements
 */
export function Sidebar({ userRole, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavigationItemsForRole(userRole);

  return (
    <div
      className={cn('flex h-full flex-col border-r bg-background', className)}
    >
      <ScrollArea className="flex-1 px-3 py-4">
        <nav
          className="flex flex-col space-y-1"
          aria-label="メインナビゲーション"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="block"
              >
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive &&
                      'bg-secondary text-secondary-foreground font-semibold'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      className="ml-auto"
                      aria-label={`${item.badge}件の通知`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer - could add additional info here */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          {userRole === '上長' ? '上長権限' : '一般営業'}
        </p>
      </div>
    </div>
  );
}
