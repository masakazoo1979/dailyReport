'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

/**
 * ログアウト処理を行うServer Action
 *
 * - セッションを完全にクリア
 * - ログインページへリダイレクト
 */
export async function logoutAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // 既にログアウト済みの場合はログインページへリダイレクト
    redirect('/login');
  }

  // セッションをクリアしてログインページへリダイレクト
  redirect('/api/auth/signout?callbackUrl=/login');
}

/**
 * 現在のセッション情報を取得するServer Action
 *
 * @returns セッション情報、未認証の場合は null
 */
export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * 現在のユーザーが認証済みかどうかを確認するServer Action
 *
 * @returns 認証済みの場合は true
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

/**
 * 現在のユーザー情報を取得するServer Action
 *
 * @returns ユーザー情報、未認証の場合は null
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/**
 * 認証が必要な処理で使用するヘルパー関数
 * 未認証の場合はログインページへリダイレクト
 *
 * @returns セッション情報（認証済み保証）
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

/**
 * 上長権限が必要な処理で使用するヘルパー関数
 * 未認証または上長でない場合はリダイレクト
 *
 * @returns セッション情報（上長権限保証）
 */
export async function requireManager() {
  const session = await requireAuth();

  if (session.user.role !== '上長') {
    redirect('/dashboard');
  }

  return session;
}
