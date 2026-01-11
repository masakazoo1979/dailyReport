'use client';

import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';

export interface HeaderProps {
  /** Current user information */
  user: User | null;
  /** Callback when logout is clicked */
  onLogout?: () => void;
  /** Callback when mobile menu button is clicked */
  onMenuClick?: () => void;
  /** Show mobile menu button (for responsive design) */
  showMobileMenu?: boolean;
}

/**
 * Header Component
 *
 * Displays the application header with:
 * - System logo/title
 * - User information
 * - Logout button
 * - Mobile menu toggle (responsive)
 *
 * Based on doc/screen-specification.md section 6.1
 */
export function Header({
  user,
  onLogout,
  onMenuClick,
  showMobileMenu = true,
}: HeaderProps) {
  // Get user initials for avatar
  const getUserInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu button */}
        {showMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={onMenuClick}
            aria-label="メニューを開く"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo and system name */}
        <div className="flex items-center space-x-2 flex-1">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">日報</span>
            </div>
            <h1 className="text-lg font-semibold md:text-xl">
              営業日報システム
            </h1>
          </div>
        </div>

        {/* User menu */}
        {user && (
          <div className="flex items-center space-x-4">
            {/* User info - desktop only */}
            <div className="hidden md:flex md:flex-col md:items-end">
              <p className="text-sm font-medium">{user.salesName}</p>
              <p className="text-xs text-muted-foreground">
                {user.department} / {user.role}
              </p>
            </div>

            {/* User menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                  aria-label="ユーザーメニュー"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials(user.salesName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.salesName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.department} / {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
