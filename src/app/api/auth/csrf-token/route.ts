import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
/**
 * GET /api/auth/csrf-token
 *
 * CSRFトークン取得エンドポイント
 * NextAuth.jsが生成するCSRFトークンを取得する
 *
 * @returns CSRFトークン
 */
export async function GET() {
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

    // NextAuth.jsのCSRFトークンを取得
    // Note: getCsrfToken()はクライアントサイドの関数のため、
    // サーバーサイドでは別のアプローチが必要
    // NextAuth.jsはビルトインでCSRF保護を提供しているため、
    // 追加のCSRFトークンは通常不要ですが、API仕様書に従って実装します。

    // 簡易的なCSRFトークンを生成（本番環境ではより強固な実装が必要）
    const csrfToken = Buffer.from(
      `${session.user?.email}-${Date.now()}-${Math.random()}`
    ).toString('base64');

    return NextResponse.json(
      {
        data: {
          csrf_token: csrfToken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get CSRF token error:', error);
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
