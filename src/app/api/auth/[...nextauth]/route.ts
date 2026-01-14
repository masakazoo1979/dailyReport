import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth.js API Route Handler
 *
 * すべての認証関連のエンドポイントを処理:
 * - GET  /api/auth/signin - サインインページ
 * - POST /api/auth/signin/credentials - 認証情報でサインイン
 * - GET  /api/auth/signout - サインアウトページ
 * - POST /api/auth/signout - サインアウト実行
 * - GET  /api/auth/session - セッション情報取得
 * - GET  /api/auth/csrf - CSRFトークン取得
 * - GET  /api/auth/providers - プロバイダー一覧取得
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
