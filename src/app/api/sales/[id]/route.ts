import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateSalesSchema } from '@/lib/validations/sales';
import { ROLES } from '@/lib/constants';

/**
 * 営業担当者詳細取得API
 * GET /api/sales/[id]
 *
 * 指定されたIDの営業担当者情報を取得します。
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 権限チェック（上長のみアクセス可）
    const userRole = (session.user as any).role;
    if (userRole !== ROLES.MANAGER) {
      return NextResponse.json(
        { error: 'この操作には上長権限が必要です' },
        { status: 403 }
      );
    }

    const params = await context.params;
    const salesId = parseInt(params.id, 10);

    if (isNaN(salesId)) {
      return NextResponse.json(
        { error: '無効な営業担当者IDです' },
        { status: 400 }
      );
    }

    // 営業担当者情報を取得
    const sales = await prisma.sales.findUnique({
      where: { salesId },
      select: {
        salesId: true,
        salesName: true,
        email: true,
        department: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!sales) {
      return NextResponse.json(
        { error: '営業担当者が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        salesId: sales.salesId,
        salesName: sales.salesName,
        email: sales.email,
        department: sales.department,
        role: sales.role,
        managerId: sales.managerId,
        managerName: sales.manager?.salesName || null,
        createdAt: sales.createdAt,
        updatedAt: sales.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    return NextResponse.json(
      { error: '営業担当者情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 営業担当者更新API
 * PUT /api/sales/[id]
 *
 * 指定されたIDの営業担当者情報を更新します。上長のみアクセス可能。
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 権限チェック（上長のみアクセス可）
    const userRole = (session.user as any).role;
    if (userRole !== ROLES.MANAGER) {
      return NextResponse.json(
        { error: 'この操作には上長権限が必要です' },
        { status: 403 }
      );
    }

    const params = await context.params;
    const salesId = parseInt(params.id, 10);

    if (isNaN(salesId)) {
      return NextResponse.json(
        { error: '無効な営業担当者IDです' },
        { status: 400 }
      );
    }

    // 営業担当者の存在確認
    const existingSales = await prisma.sales.findUnique({
      where: { salesId },
    });

    if (!existingSales) {
      return NextResponse.json(
        { error: '営業担当者が見つかりません' },
        { status: 404 }
      );
    }

    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validation = updateSalesSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const data = validation.data;

    // メールアドレスの重複チェック（自分以外）
    const existingEmail = await prisma.sales.findFirst({
      where: {
        email: data.email,
        NOT: { salesId },
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    // 上長IDが指定されている場合、存在確認
    if (data.managerId) {
      // 自分自身を上長には設定できない
      if (data.managerId === salesId) {
        return NextResponse.json(
          { error: '自分自身を上長として設定することはできません' },
          { status: 400 }
        );
      }

      const manager = await prisma.sales.findUnique({
        where: { salesId: data.managerId },
      });

      if (!manager) {
        return NextResponse.json(
          { error: '指定された上長が見つかりません' },
          { status: 400 }
        );
      }

      // 上長は「上長」ロールでなければならない
      if (manager.role !== ROLES.MANAGER) {
        return NextResponse.json(
          { error: '指定されたユーザーは上長ではありません' },
          { status: 400 }
        );
      }
    }

    // 営業担当者情報を更新
    const sales = await prisma.sales.update({
      where: { salesId },
      data: {
        salesName: data.salesName,
        email: data.email,
        department: data.department,
        role: data.role,
        managerId: data.managerId || null,
      },
      select: {
        salesId: true,
        salesName: true,
        email: true,
        department: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    // キャッシュを無効化
    revalidateTag('sales');

    return NextResponse.json({
      data: {
        salesId: sales.salesId,
        salesName: sales.salesName,
        email: sales.email,
        department: sales.department,
        role: sales.role,
        managerId: sales.managerId,
        managerName: sales.manager?.salesName || null,
        createdAt: sales.createdAt,
        updatedAt: sales.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to update sales:', error);
    return NextResponse.json(
      { error: '営業担当者情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 営業担当者削除API
 * DELETE /api/sales/[id]
 *
 * 指定されたIDの営業担当者を削除します。上長のみアクセス可能。
 * 日報が存在する場合は削除できません。
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 権限チェック（上長のみアクセス可）
    const userRole = (session.user as any).role;
    if (userRole !== ROLES.MANAGER) {
      return NextResponse.json(
        { error: 'この操作には上長権限が必要です' },
        { status: 403 }
      );
    }

    const params = await context.params;
    const salesId = parseInt(params.id, 10);

    if (isNaN(salesId)) {
      return NextResponse.json(
        { error: '無効な営業担当者IDです' },
        { status: 400 }
      );
    }

    // 自分自身を削除することはできない
    const currentUserId = (session.user as any).salesId;
    if (salesId === currentUserId) {
      return NextResponse.json(
        { error: '自分自身を削除することはできません' },
        { status: 400 }
      );
    }

    // 営業担当者の存在確認
    const existingSales = await prisma.sales.findUnique({
      where: { salesId },
      include: {
        dailyReports: true,
        subordinates: true,
      },
    });

    if (!existingSales) {
      return NextResponse.json(
        { error: '営業担当者が見つかりません' },
        { status: 404 }
      );
    }

    // 日報が紐づいている場合は削除不可
    if (existingSales.dailyReports.length > 0) {
      return NextResponse.json(
        { error: 'この営業担当者は日報が存在するため削除できません' },
        { status: 409 }
      );
    }

    // 部下がいる場合は削除不可
    if (existingSales.subordinates.length > 0) {
      return NextResponse.json(
        { error: 'この営業担当者には部下が存在するため削除できません' },
        { status: 409 }
      );
    }

    // 営業担当者を削除
    await prisma.sales.delete({
      where: { salesId },
    });

    // キャッシュを無効化
    revalidateTag('sales');

    return NextResponse.json({ message: '営業担当者を削除しました' });
  } catch (error) {
    console.error('Failed to delete sales:', error);
    return NextResponse.json(
      { error: '営業担当者の削除に失敗しました' },
      { status: 500 }
    );
  }
}
