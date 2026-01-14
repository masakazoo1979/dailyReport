import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth';

/**
 * POST /api/auth/login
 *
 * ログインエンドポイント
 * メールアドレスとパスワードで認証を行い、ユーザー情報を返す
 *
 * @param request - メールアドレスとパスワードを含むリクエスト
 * @returns ログイン成功時はユーザー情報、失敗時はエラー
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力内容に誤りがあります',
            details: validatedData.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 422 }
      );
    }

    const { email, password } = validatedData.data;

    // ユーザー検索
    const sales = await prisma.sales.findUnique({
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

    if (!sales) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'メールアドレスまたはパスワードが正しくありません',
          },
        },
        { status: 401 }
      );
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, sales.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'メールアドレスまたはパスワードが正しくありません',
          },
        },
        { status: 401 }
      );
    }

    // 成功レスポンス
    return NextResponse.json(
      {
        data: {
          sales_id: sales.salesId,
          sales_name: sales.salesName,
          email: sales.email,
          department: sales.department,
          role: sales.role,
          manager_id: sales.managerId,
          manager_name: sales.manager?.salesName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
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
