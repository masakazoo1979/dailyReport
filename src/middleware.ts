import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 認証・権限チェックミドルウェア
 *
 * - 保護されたルートへの未認証アクセスをログインページへリダイレクト
 * - 認証済みユーザーがログインページにアクセスした場合ダッシュボードへリダイレクト
 * - 上長専用ルートへの権限チェック
 */

// 認証が不要なパス
const publicPaths = ['/login', '/api/auth'];

// 上長のみがアクセスできるパス
const managerOnlyPaths = ['/sales'];

/**
 * パスが公開パスかどうかを判定
 */
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * パスが上長専用パスかどうかを判定
 */
function isManagerOnlyPath(pathname: string): boolean {
  return managerOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * パスが静的リソースかどうかを判定
 */
function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.includes('.') // ファイル拡張子があるもの (favicon.ico など)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的リソースはスキップ
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // 公開パスはスキップ（ただしログインページは認証済みならリダイレクト）
  if (isPublicPath(pathname) && pathname !== '/login') {
    return NextResponse.next();
  }

  // JWTトークンを取得してセッションを検証
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ログインページへのアクセス
  if (pathname === '/login') {
    // 認証済みならダッシュボードにリダイレクト
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 未認証ユーザーはログインページへリダイレクト
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // コールバックURLを設定（ログイン後にリダイレクト）
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 上長専用パスの権限チェック
  if (isManagerOnlyPath(pathname)) {
    const role = token.role as string | undefined;
    if (role !== '上長') {
      // 権限がない場合はダッシュボードにリダイレクト
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // セキュリティヘッダーを追加
  const response = NextResponse.next();

  // 基本的なセキュリティヘッダー
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico (ファビコン)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
