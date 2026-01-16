import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateReportSchema } from '@/lib/validations/report';
import { REPORT_STATUSES } from '@/lib/constants';

/**
 * 日報詳細取得API
 * GET /api/reports/[id]
 *
 * 日報の詳細情報を取得します（訪問記録含む）。
 * - 一般営業: 自分の日報のみ取得可能
 * - 上長: 自分と配下メンバーの日報を取得可能
 */
export async function GET(
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

    // 日報を取得
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      include: {
        sales: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
        visits: {
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
        },
        comments: {
          include: {
            sales: {
              select: {
                salesId: true,
                salesName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: '日報が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック
    if (user.role === '一般営業' && report.salesId !== user.salesId) {
      return NextResponse.json(
        { error: '閲覧権限がありません' },
        { status: 403 }
      );
    }

    // 上長の場合は配下メンバーの日報のみ閲覧可能
    if (user.role === '上長') {
      const subordinates = await prisma.sales.findMany({
        where: { managerId: user.salesId },
        select: { salesId: true },
      });

      const allowedIds = [user.salesId, ...subordinates.map((s) => s.salesId)];

      if (!allowedIds.includes(report.salesId)) {
        return NextResponse.json(
          { error: '閲覧権限がありません' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json(
      { error: '日報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 日報更新API
 * PUT /api/reports/[id]
 *
 * 日報を更新します。
 * - 自分の日報のみ更新可能
 * - ステータスが「下書き」または「差し戻し」の日報のみ更新可能
 * - 「提出済み」「承認済み」の日報は更新不可
 * - 訪問記録は既存を削除して再作成
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
    const reportId = parseInt(params.id, 10);

    if (isNaN(reportId)) {
      return NextResponse.json({ error: '日報IDが不正です' }, { status: 400 });
    }

    const body = await request.json();

    // バリデーション
    const validation = updateReportSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const { problem, plan, status, visits } = validation.data;

    // 既存の日報を取得
    const existingReport = await prisma.dailyReport.findUnique({
      where: { reportId },
      select: {
        reportId: true,
        salesId: true,
        status: true,
      },
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: '日報が見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（自分の日報のみ）
    if (existingReport.salesId !== user.salesId) {
      return NextResponse.json(
        { error: '更新権限がありません' },
        { status: 403 }
      );
    }

    // ステータスチェック（下書き・差し戻しのみ更新可能）
    if (
      existingReport.status !== REPORT_STATUSES.DRAFT &&
      existingReport.status !== REPORT_STATUSES.REJECTED
    ) {
      return NextResponse.json(
        { error: 'この日報は編集できません' },
        { status: 400 }
      );
    }

    // トランザクションで日報と訪問記録を更新
    const result = await prisma.$transaction(async (tx) => {
      // 既存の訪問記録を削除
      await tx.visit.deleteMany({
        where: { reportId },
      });

      // 日報を更新
      const report = await tx.dailyReport.update({
        where: { reportId },
        data: {
          problem: problem || null,
          plan: plan || null,
          status,
          submittedAt: status === REPORT_STATUSES.SUBMITTED ? new Date() : null,
          updatedAt: new Date(),
        },
        include: {
          sales: {
            select: {
              salesId: true,
              salesName: true,
            },
          },
        },
      });

      // 訪問記録を作成
      if (visits && visits.length > 0) {
        await tx.visit.createMany({
          data: visits.map((visit) => ({
            reportId: report.reportId,
            customerId: visit.customerId,
            visitContent: visit.visitContent,
            visitTime: new Date(`1970-01-01T${visit.visitTime}:00`),
          })),
        });
      }

      return report;
    });

    return NextResponse.json({
      message: '日報を更新しました',
      report: result,
    });
  } catch (error) {
    console.error('Failed to update report:', error);
    return NextResponse.json(
      { error: '日報の更新に失敗しました' },
      { status: 500 }
    );
  }
}
