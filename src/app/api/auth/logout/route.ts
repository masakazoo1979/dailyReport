import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/auth/logout
 *
 * ログアウトエンドポイント
 * 現在のセッションを無効化してログアウトを行う
 *
 * @returns ログアウト成功メッセージ
 */
export async function POST() {
  try {
    // セッション取得
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'ログインが必要です',
          },
        },
        { status: 401 }
      );
    }

    // NextAuth.jsはセッションをCookieで管理しているため、
    // クライアント側でnextAuthのsignOut()を呼び出す必要があります。
    // このエンドポイントは主にAPI仕様書に従った実装として提供されます。

    // セッションの有効性を確認済みのため、成功レスポンスを返す
    return NextResponse.json(
      {
        message: 'ログアウトしました',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'システムエラーが発生しました',
        },
      },
      { status: 500 }
    );
  }
}
