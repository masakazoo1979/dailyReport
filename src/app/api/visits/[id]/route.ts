import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { visitSchema } from '@/lib/validations/report';
import { ROLES, REPORT_STATUSES } from '@/lib/constants';

/**
 * 訪問記録更新API
 * PUT /api/visits/[id]
 *
 * 訪問記録を更新します。
 * - 一般営業: 自分の日報に紐づく訪問記録のみ更新可能
 * - 上長: 自分と配下メンバーの日報に紐づく訪問記録を更新可能
 * - 日報のステータスが「下書き」または「差し戻し」の場合のみ更新可能
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const params = await props.params;
    const visitId = parseInt(params.id, 10);

    if (isNaN(visitId)) {
      return NextResponse.json(
        { error: '訪問記録IDが不正です' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // snake_case → camelCase 変換（API仕様書との互換性）
    const normalizedBody = {
      visitTime: body.visit_time ?? body.visitTime,
      customerId: body.customer_id ?? body.customerId,
      visitContent: body.visit_content ?? body.visitContent,
    };

    // バリデーション
    const validation = visitSchema.safeParse(normalizedBody);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const { visitTime, customerId, visitContent } = validation.data;

    // 訪問記録の存在確認と日報情報取得
    const visit = await prisma.visit.findUnique({
      where: { visitId },
      include: {
        dailyReport: {
          select: {
            salesId: true,
            status: true,
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: '訪問記録が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    let hasAccess = false;
    if (visit.dailyReport.salesId === user.salesId) {
      hasAccess = true;
    } else if (user.role === ROLES.MANAGER) {
      const subordinates = await prisma.sales.findMany({
        where: { managerId: user.salesId },
        select: { salesId: true },
      });
      const allowedIds = [
        user.salesId,
        ...subordinates.map((s: { salesId: number }) => s.salesId),
      ];
      hasAccess = allowedIds.includes(visit.dailyReport.salesId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: '訪問記録更新権限がありません' },
        { status: 403 }
      );
    }

    // ステータスチェック（下書きまたは差し戻しのみ編集可能）
    const editableStatuses: string[] = [
      REPORT_STATUSES.DRAFT,
      REPORT_STATUSES.REJECTED,
    ];
    if (!editableStatuses.includes(visit.dailyReport.status)) {
      return NextResponse.json(
        {
          error: '提出済みまたは承認済みの日報の訪問記録は更新できません',
        },
        { status: 400 }
      );
    }

    // 顧客の存在確認
    const customer = await prisma.customer.findUnique({
      where: { customerId },
      select: { customerId: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: '指定された顧客が見つかりません' },
        { status: 404 }
      );
    }

    // visitTimeをTime型に変換（"HH:MM" -> "1970-01-01T HH:MM:00.000Z"）
    const [hours, minutes] = visitTime.split(':');
    const timeDate = new Date();
    timeDate.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // 訪問記録更新
    const updatedVisit = await prisma.visit.update({
      where: { visitId },
      data: {
        customerId,
        visitTime: timeDate,
        visitContent,
      },
      include: {
        customer: {
          select: {
            customerId: true,
            customerName: true,
            companyName: true,
          },
        },
      },
    });

    // レスポンス形式を整形
    const data = {
      visit_id: updatedVisit.visitId,
      report_id: updatedVisit.reportId,
      customer_id: updatedVisit.customer.customerId,
      customer_name: updatedVisit.customer.customerName,
      company_name: updatedVisit.customer.companyName,
      visit_time: updatedVisit.visitTime.toISOString().substring(11, 19),
      visit_content: updatedVisit.visitContent,
      created_at: updatedVisit.createdAt.toISOString(),
      updated_at: updatedVisit.updatedAt.toISOString(),
    };

    return NextResponse.json({
      message: '訪問記録を更新しました',
      data,
    });
  } catch (error) {
    console.error('Failed to update visit:', error);
    return NextResponse.json(
      { error: '訪問記録の更新に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 訪問記録削除API
 * DELETE /api/visits/[id]
 *
 * 訪問記録を削除します。
 * - 一般営業: 自分の日報に紐づく訪問記録のみ削除可能
 * - 上長: 自分と配下メンバーの日報に紐づく訪問記録を削除可能
 * - 日報のステータスが「下書き」または「差し戻し」の場合のみ削除可能
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const params = await props.params;
    const visitId = parseInt(params.id, 10);

    if (isNaN(visitId)) {
      return NextResponse.json(
        { error: '訪問記録IDが不正です' },
        { status: 400 }
      );
    }

    // 訪問記録の存在確認と日報情報取得
    const visit = await prisma.visit.findUnique({
      where: { visitId },
      include: {
        dailyReport: {
          select: {
            salesId: true,
            status: true,
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: '訪問記録が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    let hasAccess = false;
    if (visit.dailyReport.salesId === user.salesId) {
      hasAccess = true;
    } else if (user.role === ROLES.MANAGER) {
      const subordinates = await prisma.sales.findMany({
        where: { managerId: user.salesId },
        select: { salesId: true },
      });
      const allowedIds = [
        user.salesId,
        ...subordinates.map((s: { salesId: number }) => s.salesId),
      ];
      hasAccess = allowedIds.includes(visit.dailyReport.salesId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: '訪問記録削除権限がありません' },
        { status: 403 }
      );
    }

    // ステータスチェック（下書きまたは差し戻しのみ編集可能）
    const editableStatuses: string[] = [
      REPORT_STATUSES.DRAFT,
      REPORT_STATUSES.REJECTED,
    ];
    if (!editableStatuses.includes(visit.dailyReport.status)) {
      return NextResponse.json(
        {
          error: '提出済みまたは承認済みの日報の訪問記録は削除できません',
        },
        { status: 400 }
      );
    }

    // 訪問記録削除
    await prisma.visit.delete({
      where: { visitId },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete visit:', error);
    return NextResponse.json(
      { error: '訪問記録の削除に失敗しました' },
      { status: 500 }
    );
  }
}
