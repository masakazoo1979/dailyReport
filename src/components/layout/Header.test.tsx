import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { User } from '@/types';

describe('Header', () => {
  const mockUser: User = {
    salesId: 1,
    salesName: '山田太郎',
    email: 'yamada@example.com',
    department: '営業1部',
    role: '一般',
    managerId: null,
  };

  it('renders system title', () => {
    render(<Header user={mockUser} />);
    expect(screen.getByText('営業日報システム')).toBeInTheDocument();
  });

  it('renders user name in desktop view', () => {
    render(<Header user={mockUser} />);
    // User name appears in both desktop header and dropdown
    const userNames = screen.getAllByText('山田太郎');
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('renders user avatar with correct initials', () => {
    render(<Header user={mockUser} />);
    // Check for avatar fallback (initials)
    expect(screen.getByText('山田')).toBeInTheDocument();
  });

  it('renders mobile menu button when showMobileMenu is true', () => {
    render(<Header user={mockUser} showMobileMenu={true} />);
    const menuButton = screen.getByLabelText('メニューを開く');
    expect(menuButton).toBeInTheDocument();
  });

  it('does not render mobile menu button when showMobileMenu is false', () => {
    render(<Header user={mockUser} showMobileMenu={false} />);
    const menuButton = screen.queryByLabelText('メニューを開く');
    expect(menuButton).not.toBeInTheDocument();
  });

  it('calls onMenuClick when mobile menu button is clicked', async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();
    render(
      <Header user={mockUser} showMobileMenu={true} onMenuClick={onMenuClick} />
    );

    const menuButton = screen.getByLabelText('メニューを開く');
    await user.click(menuButton);

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('displays user dropdown menu when avatar is clicked', async () => {
    const user = userEvent.setup();
    render(<Header user={mockUser} />);

    const avatarButton = screen.getByLabelText('ユーザーメニュー');
    await user.click(avatarButton);

    // Check for user email in dropdown
    expect(screen.getByText('yamada@example.com')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<Header user={mockUser} onLogout={onLogout} />);

    // Open dropdown
    const avatarButton = screen.getByLabelText('ユーザーメニュー');
    await user.click(avatarButton);

    // Click logout
    const logoutButton = screen.getByText('ログアウト');
    await user.click(logoutButton);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('displays user role and department', async () => {
    const user = userEvent.setup();
    render(<Header user={mockUser} />);

    // Open dropdown to see full details
    const avatarButton = screen.getByLabelText('ユーザーメニュー');
    await user.click(avatarButton);

    // Check for department and role (appears multiple times)
    const departmentRoleText = screen.getAllByText(/営業1部.*一般/);
    expect(departmentRoleText.length).toBeGreaterThan(0);
  });

  it('handles user with no user prop gracefully', () => {
    render(<Header user={null} />);
    expect(screen.getByText('営業日報システム')).toBeInTheDocument();
    expect(screen.queryByLabelText('ユーザーメニュー')).not.toBeInTheDocument();
  });
});
