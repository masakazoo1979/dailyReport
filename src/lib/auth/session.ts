import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ROLES } from '@/lib/constants';

/**
 * 認証済みセッションを取得するヘルパー関数
 * 未認証の場合はログインページへリダイレクト
 *
 * @returns 認証済みセッション（ユーザー情報を含む）
 */
export async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

/**
 * 現在のユーザー情報を取得
 * 未認証の場合は null を返す
 *
 * @returns ユーザー情報または null
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user as SessionUser | null;
}

/**
 * 上長権限を持つセッションを取得
 * 未認証または上長でない場合はダッシュボードへリダイレクト
 *
 * @returns 上長権限を持つセッション
 */
export async function getManagerSession() {
  const session = await getAuthenticatedSession();

  if (session.user.role !== ROLES.MANAGER) {
    redirect('/dashboard');
  }

  return session;
}

/**
 * ユーザーが自分自身かどうかを確認
 *
 * @param user 現在のユーザー
 * @param targetSalesId 対象の営業担当者ID
 * @returns 自分自身の場合は true
 */
export function isSelf(user: SessionUser, targetSalesId: number): boolean {
  return user.salesId === targetSalesId;
}

/**
 * ユーザーが対象の上長かどうかを確認
 *
 * @param user 現在のユーザー
 * @param targetManagerId 対象の上長ID
 * @returns 上長の場合は true
 */
export function isManagerOf(
  user: SessionUser,
  targetManagerId: number | null
): boolean {
  if (user.role !== ROLES.MANAGER) {
    return false;
  }
  return targetManagerId === user.salesId;
}
