import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/me
 *
 * ログインユーザー情報取得エンドポイント
 * 現在ログインしているユーザーの情報を返す
 *
 * @returns ログインユーザー情報（上長情報含む）
 */
export async function GET() {
  try {
    // セッション取得
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
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

    const user = session.user as SessionUser;

    // データベースから最新のユーザー情報を取得
    const sales = await prisma.sales.findUnique({
      where: { salesId: user.salesId },
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
            code: 'USER_NOT_FOUND',
            message: 'ユーザーが見つかりません',
          },
        },
        { status: 404 }
      );
    }

    // レスポンス
    return NextResponse.json(
      {
        data: {
          sales_id: sales.salesId,
          sales_name: sales.salesName,
          email: sales.email,
          department: sales.department,
          role: sales.role,
          manager_id: sales.managerId,
          manager_name: sales.manager?.salesName || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
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
