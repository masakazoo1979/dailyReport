import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { visitSchema } from '@/lib/validations/report';
import { ROLES, REPORT_STATUSES } from '@/lib/constants';
import { Prisma } from '@prisma/client';

type VisitWithCustomer = Prisma.VisitGetPayload<{
  include: {
    customer: {
      select: {
        customerId: true;
        customerName: true;
        companyName: true;
      };
    };
  };
}>;

/**
 * 訪問記録一覧取得API
 * GET /api/reports/[id]/visits
 *
 * 日報に紐づく訪問記録一覧を取得します。
 * - 一般営業: 自分の日報のみ取得可能
 * - 上長: 自分と配下メンバーの日報を取得可能
 */
export async function GET(
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
    const reportId = parseInt(params.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: '日報IDが不正です' }, { status: 400 });
    }

    // 日報の存在確認と権限チェック
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      select: { salesId: true },
    });

    if (!report) {
      return NextResponse.json(
        { error: '日報が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    let hasAccess = false;
    if (report.salesId === user.salesId) {
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
      hasAccess = allowedIds.includes(report.salesId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: '閲覧権限がありません' },
        { status: 403 }
      );
    }

    // 訪問記録取得
    const visits = await prisma.visit.findMany({
      where: { reportId },
      include: {
        customer: {
          select: {
            customerId: true,
            customerName: true,
            companyName: true,
          },
        },
      },
      orderBy: {
        visitTime: 'asc',
      },
    });

    // レスポンス形式を整形
    const data = visits.map((visit: VisitWithCustomer) => ({
      visit_id: visit.visitId,
      report_id: visit.reportId,
      customer_id: visit.customer.customerId,
      customer_name: visit.customer.customerName,
      company_name: visit.customer.companyName,
      visit_time: visit.visitTime.toISOString().substring(11, 19), // "HH:MM:SS" format
      visit_content: visit.visitContent,
      created_at: visit.createdAt.toISOString(),
      updated_at: visit.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch visits:', error);
    return NextResponse.json(
      { error: '訪問記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 訪問記録作成API
 * POST /api/reports/[id]/visits
 *
 * 日報に訪問記録を追加します。
 * - 一般営業: 自分の日報のみ追加可能
 * - 上長: 自分と配下メンバーの日報に追加可能
 * - 日報のステータスが「下書き」または「差し戻し」の場合のみ追加可能
 */
export async function POST(
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
    const reportId = parseInt(params.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: '日報IDが不正です' }, { status: 400 });
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

    // 日報の存在確認と権限チェック
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      select: {
        salesId: true,
        status: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: '日報が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    let hasAccess = false;
    if (report.salesId === user.salesId) {
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
      hasAccess = allowedIds.includes(report.salesId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: '訪問記録追加権限がありません' },
        { status: 403 }
      );
    }

    // ステータスチェック（下書きまたは差し戻しのみ編集可能）
    const editableStatuses = [REPORT_STATUSES.DRAFT, REPORT_STATUSES.REJECTED];
    if (!editableStatuses.includes(report.status)) {
      return NextResponse.json(
        {
          error: '提出済みまたは承認済みの日報には訪問記録を追加できません',
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

    // 訪問記録作成
    const visit = await prisma.visit.create({
      data: {
        reportId,
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
      visit_id: visit.visitId,
      report_id: visit.reportId,
      customer_id: visit.customer.customerId,
      customer_name: visit.customer.customerName,
      company_name: visit.customer.companyName,
      visit_time: visit.visitTime.toISOString().substring(11, 19),
      visit_content: visit.visitContent,
      created_at: visit.createdAt.toISOString(),
      updated_at: visit.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        message: '訪問記録を追加しました',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create visit:', error);
    return NextResponse.json(
      { error: '訪問記録の追加に失敗しました' },
      { status: 500 }
    );
  }
}
