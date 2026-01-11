import { Metadata } from 'next';
import { MainLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: '営業日報システム',
  description: 'Sales Daily Report Management System',
};

/**
 * Dashboard Layout
 *
 * Layout for authenticated dashboard pages
 * Uses MainLayout component (Header + Sidebar + Content)
 *
 * Based on doc/screen-specification.md common layout specifications
 *
 * TODO: Implement proper authentication check
 * - Check session/auth status
 * - Redirect to login if not authenticated
 * - Fetch user data from session
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Replace with actual authentication
  // This is a temporary mock user for development/testing
  // In production, this should:
  // 1. Check NextAuth session
  // 2. Redirect to /login if not authenticated
  // 3. Fetch user data from database based on session
  const mockUser = {
    salesId: 1,
    salesName: '山田太郎',
    email: 'yamada@example.com',
    department: '営業1部',
    role: '一般' as const, // Change to '上長' to test manager view
    managerId: null,
  };

  const handleLogout = async () => {
    // TODO: Implement actual logout logic
    // - Call NextAuth signOut()
    // - Clear session
    // - Redirect to login
    console.log('Logout clicked');
  };

  return (
    <MainLayout user={mockUser} onLogout={handleLogout}>
      {children}
    </MainLayout>
  );
}
