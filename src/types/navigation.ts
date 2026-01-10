/**
 * Navigation menu types
 */

import { LucideIcon } from 'lucide-react';
import { UserRole } from './auth';

/**
 * Navigation menu item
 */
export interface NavigationItem {
  /** Display label */
  label: string;
  /** Link href */
  href: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Roles that can access this menu item */
  roles: UserRole[];
  /** Badge text (e.g., notification count) */
  badge?: string;
}

/**
 * Navigation group (optional for future expansion)
 */
export interface NavigationGroup {
  /** Group title */
  title?: string;
  /** Navigation items in this group */
  items: NavigationItem[];
}
