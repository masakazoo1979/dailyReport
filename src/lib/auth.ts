import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./auth/password";
import { loginSchema } from "./validations/auth";

/**
 * NextAuth.jsのセッション型を拡張
 */
declare module "next-auth" {
  interface Session {
    user: {
      salesId: number;
      salesName: string;
      email: string;
      department: string;
      role: "一般" | "上長";
      managerId: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    salesId: number;
    salesName: string;
    email: string;
    department: string;
    role: "一般" | "上長";
    managerId: number | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    salesId: number;
    salesName: string;
    email: string;
    department: string;
    role: "一般" | "上長";
    managerId: number | null;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // バリデーション
          const validatedFields = loginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // ユーザーを取得
          const user = await prisma.sales.findUnique({
            where: { email },
            include: {
              manager: {
                select: {
                  salesId: true,
                  salesName: true,
                },
              },
            },
          });

          if (!user) {
            return null;
          }

          // パスワード検証
          const isPasswordValid = await verifyPassword(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // ユーザー情報を返す
          return {
            id: user.salesId.toString(),
            salesId: user.salesId,
            salesName: user.salesName,
            email: user.email,
            department: user.department,
            role: user.role as "一般" | "上長",
            managerId: user.managerId,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
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
        session.user.salesId = token.salesId;
        session.user.salesName = token.salesName;
        session.user.email = token.email;
        session.user.department = token.department;
        session.user.role = token.role;
        session.user.managerId = token.managerId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
