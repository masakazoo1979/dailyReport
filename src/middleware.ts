import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 認証・権限チェックミドルウェア
 *
 * - 保護されたルートへの未認証アクセスをログインページへリダイレクト
 * - 認証済みユーザーがログインページにアクセスした場合ダッシュボードへリダイレクト
 * - 上長専用ルートへの権限チェック
 *
 * 注意: セキュリティヘッダーは next.config.js で設定しているため、
 *       このミドルウェアでは設定しない
 */

// 認証が不要なパス（/loginは別途処理するため含めない）
const publicPaths = ['/api/auth'];

// 上長のみがアクセスできるパス
const managerOnlyPaths = ['/sales'];

// 静的リソースのファイル拡張子パターン
const staticFileExtensions =
  /\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|css|js|map)$/i;

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
 * ファイル拡張子で判定することで、バージョン付きAPIパスを誤ってスキップしない
 */
function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    staticFileExtensions.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // デバッグログ（CI環境で確認用）
  console.error(`[Middleware] Request: ${pathname}`);

  // 静的リソースはスキップ
  if (isStaticPath(pathname)) {
    console.error(`[Middleware] Static path, skipping: ${pathname}`);
    return NextResponse.next();
  }

  // 公開パスはスキップ
  if (isPublicPath(pathname)) {
    console.error(`[Middleware] Public path, skipping: ${pathname}`);
    return NextResponse.next();
  }

  // JWTトークンを取得してセッションを検証
  console.error(
    `[Middleware] Checking token for: ${pathname}, secret set: ${!!process.env.NEXTAUTH_SECRET}`
  );
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  console.error(
    `[Middleware] Token result: ${token ? 'authenticated' : 'no token'}`
  );

  // ログインページへのアクセス
  if (pathname === '/login') {
    // 認証済みならダッシュボードにリダイレクト
    if (token) {
      console.error(
        `[Middleware] Login page + authenticated -> redirect to /dashboard`
      );
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    console.error(`[Middleware] Login page + unauthenticated -> allow`);
    return NextResponse.next();
  }

  // 未認証ユーザーはログインページへリダイレクト
  if (!token) {
    console.error(
      `[Middleware] Protected route + no token -> redirect to /login`
    );
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

  return NextResponse.next();
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
