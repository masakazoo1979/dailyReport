import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSalesSchema } from '@/lib/validations/sales';
import { ROLES } from '@/lib/constants';

/**
 * 営業担当者一覧取得API
 * GET /api/sales
 *
 * 上長のみがアクセス可能な営業担当者の一覧を取得します。
 * クエリパラメータでフィルタリング・ソートが可能です。
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const salesName = searchParams.get('salesName') || '';
    const department = searchParams.get('department') || '';
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'salesName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    // デフォルト limit を20に最適化（パフォーマンス改善）
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100
    );

    // 検索条件の構築
    const where = {
      ...(salesName && {
        salesName: { contains: salesName },
      }),
      ...(department && {
        department: { contains: department },
      }),
      ...(role && { role }),
    };

    // ソート条件の構築
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    };

    // データ取得
    const [salesList, totalCount] = await Promise.all([
      prisma.sales.findMany({
        where,
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
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sales.count({ where }),
    ]);

    // レスポンス形式を整形
    const formattedSales = salesList.map((sales) => ({
      salesId: sales.salesId,
      salesName: sales.salesName,
      email: sales.email,
      department: sales.department,
      role: sales.role,
      managerId: sales.managerId,
      managerName: sales.manager?.salesName || null,
      createdAt: sales.createdAt,
      updatedAt: sales.updatedAt,
    }));

    return NextResponse.json({
      data: formattedSales,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch sales list:', error);
    return NextResponse.json(
      { error: '営業担当者一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 営業担当者作成API
 * POST /api/sales
 *
 * 新しい営業担当者を作成します。上長のみアクセス可能。
 */
export async function POST(request: NextRequest) {
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

    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validation = createSalesSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const data = validation.data;

    // メールアドレスの重複チェック
    const existingEmail = await prisma.sales.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      );
    }

    // 上長IDが指定されている場合、存在確認
    if (data.managerId) {
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

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 営業担当者を作成
    const sales = await prisma.sales.create({
      data: {
        salesName: data.salesName,
        email: data.email,
        password: hashedPassword,
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

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create sales:', error);
    return NextResponse.json(
      { error: '営業担当者の作成に失敗しました' },
      { status: 500 }
    );
  }
}
