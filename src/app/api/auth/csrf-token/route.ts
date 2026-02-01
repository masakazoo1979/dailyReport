import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/auth/csrf-token
 *
 * CSRFトークン取得エンドポイント
 *
 * NextAuth.jsビルトインのCSRF保護機能を使用してトークンを返します。
 * このエンドポイントはNextAuth.jsの `/api/auth/csrf` と同等の機能を提供します。
 *
 * Note: NextAuth.jsは内部的にCSRF保護を実装しているため、
 * 通常のフォーム送信では追加のCSRFトークン処理は不要です。
 * このエンドポイントはAPI仕様書との互換性のために提供されています。
 *
 * @deprecated NextAuth.jsビルトインの `/api/auth/csrf` の使用を推奨します。
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

    // NextAuth.jsのCSRFトークンをクッキーから取得
    const cookieStore = await cookies();
    const csrfCookieName =
      process.env.NODE_ENV === 'production' && !process.env.CI
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token';

    const csrfCookie = cookieStore.get(csrfCookieName);

    if (!csrfCookie?.value) {
      // CSRFトークンが見つからない場合は、NextAuth.jsの内部メカニズムに依存
      // クライアントは /api/auth/csrf を直接呼び出すことを推奨
      console.warn(
        '[CSRF Token API] CSRF cookie not found. Client should use /api/auth/csrf instead.'
      );

      return NextResponse.json(
        {
          data: {
            csrf_token: null,
            message:
              'CSRFトークンはNextAuth.jsによって自動管理されています。' +
              '/api/auth/csrf を使用してください。',
          },
        },
        { status: 200 }
      );
    }

    // NextAuth.jsのCSRFトークンは "token|hash" 形式で保存されている
    // トークン部分のみを返す
    const csrfToken = csrfCookie.value.split('|')[0];

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
