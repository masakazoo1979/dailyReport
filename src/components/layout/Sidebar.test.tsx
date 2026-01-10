import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar', () => {
  it('renders navigation menu for 一般営業', () => {
    render(<Sidebar userRole="一般" />);

    // Should show common menu items
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('日報一覧')).toBeInTheDocument();
    expect(screen.getByText('日報登録')).toBeInTheDocument();
    expect(screen.getByText('顧客マスタ')).toBeInTheDocument();

    // Should NOT show manager-only items
    expect(screen.queryByText('承認待ち日報')).not.toBeInTheDocument();
    expect(screen.queryByText('営業マスタ')).not.toBeInTheDocument();
  });

  it('renders navigation menu for 上長', () => {
    render(<Sidebar userRole="上長" />);

    // Should show all menu items
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('日報一覧')).toBeInTheDocument();
    expect(screen.getByText('日報登録')).toBeInTheDocument();
    expect(screen.getByText('顧客マスタ')).toBeInTheDocument();

    // Should show manager-only items
    expect(screen.getByText('承認待ち日報')).toBeInTheDocument();
    expect(screen.getByText('営業マスタ')).toBeInTheDocument();
  });

  it('displays role badge', () => {
    render(<Sidebar userRole="一般" />);
    expect(screen.getByText('一般営業')).toBeInTheDocument();
  });

  it('displays manager role badge', () => {
    render(<Sidebar userRole="上長" />);
    expect(screen.getByText('上長権限')).toBeInTheDocument();
  });

  it('calls onNavigate when menu item is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Sidebar userRole="一般" onNavigate={onNavigate} />);

    const dashboardLink = screen.getByText('ダッシュボード');
    await user.click(dashboardLink);

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('renders all navigation items as links', () => {
    render(<Sidebar userRole="一般" />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // Each link should have proper href
    links.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <Sidebar userRole="一般" className="custom-class" />
    );

    const sidebar = container.firstChild;
    expect(sidebar).toHaveClass('custom-class');
  });
});
