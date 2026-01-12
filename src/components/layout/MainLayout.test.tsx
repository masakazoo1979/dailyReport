import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainLayout } from './MainLayout';
import { User } from '@/types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('MainLayout', () => {
  const mockUser: User = {
    salesId: 1,
    salesName: '山田太郎',
    email: 'yamada@example.com',
    department: '営業1部',
    role: '一般',
    managerId: null,
  };

  it('renders header and sidebar with user', () => {
    render(
      <MainLayout user={mockUser}>
        <div>Test Content</div>
      </MainLayout>
    );

    // Header should be present
    expect(screen.getByText('営業日報システム')).toBeInTheDocument();

    // User name should be visible
    expect(screen.getAllByText('山田太郎').length).toBeGreaterThan(0);

    // Sidebar navigation should be present
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();

    // Content should be rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <MainLayout user={mockUser}>
        <div data-testid="child-content">Child Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders logout button in user menu', async () => {
    const user = userEvent.setup();

    render(
      <MainLayout user={mockUser}>
        <div>Content</div>
      </MainLayout>
    );

    // Open user menu
    const avatarButton = screen.getByLabelText('ユーザーメニュー');
    await user.click(avatarButton);

    // Check logout button exists
    const logoutButton = screen.getByText('ログアウト');
    expect(logoutButton).toBeInTheDocument();
  });

  it('shows loading state when no user', () => {
    render(
      <MainLayout user={null}>
        <div>Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders mobile menu button on mobile view', () => {
    render(
      <MainLayout user={mockUser}>
        <div>Content</div>
      </MainLayout>
    );

    const mobileMenuButton = screen.getByLabelText('メニューを開く');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('renders role-based navigation for manager', () => {
    const managerUser: User = {
      ...mockUser,
      role: '上長',
    };

    render(
      <MainLayout user={managerUser}>
        <div>Content</div>
      </MainLayout>
    );

    // Manager should see manager-only menu items
    expect(screen.getByText('承認待ち日報')).toBeInTheDocument();
    expect(screen.getByText('営業マスタ')).toBeInTheDocument();
  });
});
