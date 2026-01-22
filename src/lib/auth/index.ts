/**
 * 認証関連のヘルパー関数をエクスポート
 */

// セッション関連のヘルパー
export {
  getAuthenticatedSession,
  getCurrentUser,
  getManagerSession,
  isSelf,
  isManagerOf,
} from './session';

// API関連のヘルパー
export {
  withAuth,
  withManagerAuth,
  canAccessResource,
  createErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  type AuthResult,
  type ManagerAuthResult,
} from './api';
