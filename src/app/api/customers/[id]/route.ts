import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCustomerSchema } from '@/lib/validations/customer';

/**
 * 顧客詳細取得API
 * GET /api/customers/[id]
 *
 * 指定されたIDの顧客情報を取得します。
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

    const params = await context.params;
    const customerId = parseInt(params.id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: '無効な顧客IDです' }, { status: 400 });
    }

    // 顧客情報を取得
    const customer = await prisma.customer.findUnique({
      where: { customerId },
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

    if (!customer) {
      return NextResponse.json(
        { error: '顧客が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json(
      { error: '顧客情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 顧客更新API
 * PUT /api/customers/[id]
 *
 * 指定されたIDの顧客情報を更新します。
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

    const params = await context.params;
    const customerId = parseInt(params.id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: '無効な顧客IDです' }, { status: 400 });
    }

    // 顧客の存在確認
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: '顧客が見つかりません' },
        { status: 404 }
      );
    }

    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validation = updateCustomerSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 顧客情報を更新
    const customer = await prisma.customer.update({
      where: { customerId },
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

    // キャッシュを無効化
    revalidateTag('customers');

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json(
      { error: '顧客情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 顧客削除API
 * DELETE /api/customers/[id]
 *
 * 指定されたIDの顧客を削除します。
 * 訪問記録に紐づいている場合は削除できません。
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

    const params = await context.params;
    const customerId = parseInt(params.id, 10);

    if (isNaN(customerId)) {
      return NextResponse.json({ error: '無効な顧客IDです' }, { status: 400 });
    }

    // 顧客の存在確認
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId },
      include: {
        visits: true,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: '顧客が見つかりません' },
        { status: 404 }
      );
    }

    // 訪問記録が紐づいている場合は削除不可
    if (existingCustomer.visits.length > 0) {
      return NextResponse.json(
        { error: 'この顧客は訪問記録に使用されているため削除できません' },
        { status: 400 }
      );
    }

    // 顧客を削除
    await prisma.customer.delete({
      where: { customerId },
    });

    // キャッシュを無効化
    revalidateTag('customers');

    return NextResponse.json({ message: '顧客を削除しました' });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json(
      { error: '顧客の削除に失敗しました' },
      { status: 500 }
    );
  }
}
