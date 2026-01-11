import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { verifyPassword } from './auth/password';
import { loginSchema } from './validations/auth';
import { AUTH_CONSTANTS } from './constants/auth';
import { validateEnv } from './env';
import {
  isRateLimited,
  incrementRateLimit,
  resetRateLimit,
} from './auth/rate-limit';
import {
  logLoginSuccess,
  logLoginFailed,
  logAudit,
  AuditAction,
} from './auth/audit-log';

// 環境変数を検証
validateEnv();

/**
 * NextAuth.jsのセッション型を拡張
 */
declare module 'next-auth' {
  interface Session {
    user: {
      salesId: number;
      salesName: string;
      email: string;
      department: string;
      role: '一般' | '上長';
      managerId: number | null;
    } & DefaultSession['user'];
  }

  interface User {
    salesId: number;
    salesName: string;
    email: string;
    department: string;
    role: '一般' | '上長';
    managerId: number | null;
  }
}

// Note: JWT type augmentation removed as it's not available in NextAuth v5 beta

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        let email: string | undefined;
        try {
          // バリデーション
          const validatedFields = loginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          email = validatedFields.data.email;
          const password = validatedFields.data.password;

          // レート制限チェック
          if (isRateLimited(email)) {
            console.warn(`Rate limit exceeded for email: ${email}`);
            await logAudit({
              action: AuditAction.RATE_LIMIT_EXCEEDED,
              email,
            });
            return null;
          }

          // ユーザーを取得
          const user = await prisma.sales.findUnique({
            where: { email },
            select: {
              salesId: true,
              salesName: true,
              email: true,
              password: true,
              department: true,
              role: true,
              managerId: true,
            },
          });

          // タイミング攻撃対策: ユーザーが存在しない場合もダミーハッシュで検証
          const hashedPassword =
            user?.password ?? AUTH_CONSTANTS.DUMMY_PASSWORD_HASH;
          const isPasswordValid = await verifyPassword(
            password,
            hashedPassword
          );

          // ユーザーが存在しない、またはパスワードが無効な場合
          if (!user || !isPasswordValid) {
            // 監査ログに失敗を記録
            // 注: IPアドレスとユーザーエージェントはCredentialsProviderからは取得できない
            await logLoginFailed(
              email,
              !user ? 'USER_NOT_FOUND' : 'INVALID_PASSWORD'
            );
            // レート制限カウントをインクリメント
            incrementRateLimit(email);
            return null;
          }

          // 役割の検証
          if (user.role !== '一般' && user.role !== '上長') {
            console.error(`Invalid role for user ${user.email}: ${user.role}`);
            await logLoginFailed(email, 'INVALID_ROLE');
            // レート制限カウントをインクリメント
            incrementRateLimit(email);
            return null;
          }

          // 監査ログに成功を記録
          await logLoginSuccess(email);

          // ログイン成功時はレート制限をリセット
          resetRateLimit(email);

          // ユーザー情報を返す
          return {
            id: user.salesId.toString(),
            salesId: user.salesId,
            salesName: user.salesName,
            email: user.email,
            department: user.department,
            role: user.role,
            managerId: user.managerId,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          // 例外が発生した場合も監査ログに記録
          if (email) {
            await logLoginFailed(email, 'SYSTEM_ERROR').catch(() => {
              // 監査ログの記録失敗は無視
            });
            incrementRateLimit(email);
          }
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: AUTH_CONSTANTS.SESSION_MAX_AGE_SECONDS,
    updateAge: AUTH_CONSTANTS.SESSION_UPDATE_AGE_SECONDS,
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.salesId = user.salesId;
        token.salesName = user.salesName;
        token.email = user.email;
        token.department = user.department;
        token.role = user.role;
        token.managerId = user.managerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.salesId = token.salesId as number;
        session.user.salesName = token.salesName as string;
        session.user.email = token.email as string;
        session.user.department = token.department as string;
        session.user.role = token.role as '一般' | '上長';
        session.user.managerId = token.managerId as number | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
