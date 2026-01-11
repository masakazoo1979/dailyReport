'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { User } from '@/types';
import { logoutAction } from '@/app/actions/auth';

export interface MainLayoutProps {
  /** Current user information */
  user: User | null;
  /** Page content */
  children: React.ReactNode;
}

/**
 * MainLayout Component
 *
 * Main application layout with:
 * - Header (logo, user info, logout)
 * - Sidebar navigation (desktop: always visible, mobile: sheet/drawer)
 * - Content area
 * - Responsive grid layout
 *
 * Layout structure:
 * - Desktop: Fixed sidebar (256px) + Header + Content
 * - Mobile: Header with hamburger menu + Sheet for navigation
 *
 * Uses Server Actions for logout to avoid passing event handlers from Server Components
 *
 * Based on doc/screen-specification.md common specifications
 */
export function MainLayout({ user, children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavigate = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      // Server Actions handle redirects by throwing,
      // so we catch and ignore the error
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    // If no user, render minimal layout (should redirect to login)
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onMenuClick={handleMobileMenuToggle}
        showMobileMenu={true}
      />

      {/* Main content area */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden md:block w-64 border-r">
          <Sidebar userRole={user.role} />
        </aside>

        {/* Mobile Sidebar - Sheet/Drawer */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar userRole={user.role} onNavigate={handleMobileNavigate} />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
