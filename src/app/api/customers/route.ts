import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCustomerSchema } from '@/lib/validations/customer';

/**
 * 顧客一覧取得API
 * GET /api/customers
 *
 * 認証済みユーザーが利用可能な顧客の一覧を取得します。
 * クエリパラメータでフィルタリング・ソートが可能です。
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'companyName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    // デフォルト limit を20に最適化（パフォーマンス改善）
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100
    );

    // 検索条件の構築
    const where = search
      ? {
          OR: [
            { companyName: { contains: search } },
            { customerName: { contains: search } },
            { industry: { contains: search } },
          ],
        }
      : {};

    // ソート条件の構築
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    };

    // データ取得
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: {
          customerId: true,
          customerName: true,
          companyName: true,
          industry: true,
          phone: true,
          email: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json(
      { error: '顧客一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 顧客作成API
 * POST /api/customers
 *
 * 新しい顧客を作成します。
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validation = createCustomerSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 顧客を作成
    const customer = await prisma.customer.create({
      data: {
        companyName: data.companyName,
        customerName: data.customerName,
        industry: data.industry || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
      select: {
        customerId: true,
        customerName: true,
        companyName: true,
        industry: true,
        phone: true,
        email: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json(
      { error: '顧客の作成に失敗しました' },
      { status: 500 }
    );
  }
}
