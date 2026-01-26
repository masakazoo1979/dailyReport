import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { loginSchema } from './validations/auth';

/**
 * NextAuth設定
 *
 * - Prisma Adapterを使用してセッション管理
 * - Credentials Providerでメール/パスワード認証を実装
 * - JWT戦略を使用
 */
// CI環境ではHTTPでテストするため、セキュアクッキーを無効にする必要がある
const useSecureCookies =
  process.env.NODE_ENV === 'production' && !process.env.CI;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  cookies: {
    sessionToken: {
      name: useSecureCookies
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: useSecureCookies
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: useSecureCookies
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください');
        }

        // バリデーション
        const validatedData = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!validatedData.success) {
          throw new Error('入力内容に誤りがあります');
        }

        const { email, password } = validatedData.data;

        // ユーザー検索（Salesテーブルから）
        const sales = await prisma.sales.findUnique({
          where: { email },
        });

        if (!sales) {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        // パスワード検証
        const isPasswordValid = await bcrypt.compare(password, sales.password);

        if (!isPasswordValid) {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        // 認証成功 - ユーザー情報を返す
        return {
          id: sales.salesId.toString(),
          email: sales.email,
          name: sales.salesName,
          role: sales.role,
          department: sales.department,
          salesId: sales.salesId,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // 初回ログイン時にユーザー情報をトークンに追加
      if (user) {
        token.salesId = (user as any).salesId;
        token.role = (user as any).role;
        token.department = (user as any).department;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにカスタムフィールドを追加
      if (session.user) {
        (session.user as any).salesId = token.salesId;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development' && !process.env.CI,
};

/**
 * セッションからユーザー情報を取得するヘルパー型
 */
export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  salesId: number;
  role: string;
  department: string;
}
