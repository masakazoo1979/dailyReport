/**
 * Authentication and User types
 */

/**
 * User role enum
 */
export type UserRole = '一般' | '上長';

/**
 * User session type
 */
export interface User {
  salesId: number;
  salesName: string;
  email: string;
  department: string;
  role: UserRole;
  managerId: number | null;
}

/**
 * Session type
 */
export interface Session {
  user: User | null;
  expires: string;
}
