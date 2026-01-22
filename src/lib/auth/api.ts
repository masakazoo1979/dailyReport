import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions, SessionUser } from '@/lib/auth';
import { ROLES } from '@/lib/constants';

/**
 * API用の認証チェック結果
 */
export type AuthResult =
  | { success: true; user: SessionUser }
  | { success: false; response: NextResponse };

/**
 * API用の上長権限チェック結果
 */
export type ManagerAuthResult =
  | { success: true; user: SessionUser }
  | { success: false; response: NextResponse };

/**
 * API ルートで認証をチェック
 * 未認証の場合は 401 エラーレスポンスを返す
 *
 * @returns 認証結果（成功時はユーザー情報、失敗時はエラーレスポンス）
 */
export async function withAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      success: false,
      response: NextResponse.json({ error: '認証が必要です' }, { status: 401 }),
    };
  }

  return {
    success: true,
    user: session.user as SessionUser,
  };
}

/**
 * API ルートで上長権限をチェック
 * 未認証または上長でない場合はエラーレスポンスを返す
 *
 * @returns 認証結果（成功時はユーザー情報、失敗時はエラーレスポンス）
 */
export async function withManagerAuth(): Promise<ManagerAuthResult> {
  const authResult = await withAuth();

  if (!authResult.success) {
    return authResult;
  }

  if (authResult.user.role !== ROLES.MANAGER) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'この操作には上長権限が必要です' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * ユーザーが指定されたリソースにアクセスできるかチェック
 *
 * @param user 現在のユーザー
 * @param resourceSalesId リソースの所有者ID
 * @param resourceManagerId リソースの所有者の上長ID（オプション）
 * @returns アクセス可能な場合は true
 */
export function canAccessResource(
  user: SessionUser,
  resourceSalesId: number,
  resourceManagerId?: number | null
): boolean {
  // 自分のリソースにはアクセス可能
  if (user.salesId === resourceSalesId) {
    return true;
  }

  // 上長は配下メンバーのリソースにアクセス可能
  if (user.role === ROLES.MANAGER && resourceManagerId === user.salesId) {
    return true;
  }

  return false;
}

/**
 * APIエラーレスポンスを生成
 *
 * @param message エラーメッセージ
 * @param status HTTPステータスコード
 * @returns エラーレスポンス
 */
export function createErrorResponse(
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 未認証エラーレスポンスを生成
 */
export function unauthorizedResponse(): NextResponse {
  return createErrorResponse('認証が必要です', 401);
}

/**
 * 権限不足エラーレスポンスを生成
 */
export function forbiddenResponse(): NextResponse {
  return createErrorResponse('この操作を行う権限がありません', 403);
}

/**
 * リソースが見つからないエラーレスポンスを生成
 */
export function notFoundResponse(resource: string = 'リソース'): NextResponse {
  return createErrorResponse(`${resource}が見つかりません`, 404);
}
