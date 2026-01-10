/**
 * Navigation menu configuration
 */

import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Building2,
  UserCog,
  CheckSquare,
} from 'lucide-react';
import { NavigationItem } from '@/types';

/**
 * Navigation menu items
 * Based on doc/screen-specification.md and doc/screen-transition.md
 */
export const navigationItems: NavigationItem[] = [
  {
    label: 'ダッシュボード',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['一般', '上長'],
  },
  {
    label: '日報一覧',
    href: '/dashboard/reports',
    icon: FileText,
    roles: ['一般', '上長'],
  },
  {
    label: '日報登録',
    href: '/dashboard/reports/new',
    icon: FilePlus,
    roles: ['一般', '上長'],
  },
  {
    label: '承認待ち日報',
    href: '/dashboard/reports/pending',
    icon: CheckSquare,
    roles: ['上長'], // 上長のみ
  },
  {
    label: '顧客マスタ',
    href: '/dashboard/customers',
    icon: Building2,
    roles: ['一般', '上長'],
  },
  {
    label: '営業マスタ',
    href: '/dashboard/sales',
    icon: UserCog,
    roles: ['上長'], // 上長のみ
  },
];

/**
 * Filter navigation items by user role
 */
export function getNavigationItemsForRole(
  userRole: '一般' | '上長'
): NavigationItem[] {
  return navigationItems.filter((item) => item.roles.includes(userRole));
}
