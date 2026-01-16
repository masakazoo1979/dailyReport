import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { REPORT_STATUSES, ROLES } from '@/lib/constants';

/**
 * 日報承認API
 * POST /api/reports/[id]/approve
 *
 * 日報を承認します（上長のみ）。
 * - ステータスを「承認済み」に変更
 * - 承認日時と承認者を記録
 */
export async function POST(
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

    // 上長権限チェック
    if (user.role !== ROLES.MANAGER) {
      return NextResponse.json(
        { error: '承認権限がありません' },
        { status: 403 }
      );
    }

    // 日報を取得
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      select: {
        reportId: true,
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

    // 自分の日報は承認不可
    if (report.salesId === user.salesId) {
      return NextResponse.json(
        { error: '自分の日報は承認できません' },
        { status: 400 }
      );
    }

    // 配下メンバーの日報かチェック
    const subordinates = await prisma.sales.findMany({
      where: { managerId: user.salesId },
      select: { salesId: true },
    });
    const allowedIds = subordinates.map((s) => s.salesId);

    if (!allowedIds.includes(report.salesId)) {
      return NextResponse.json(
        { error: '承認権限がありません' },
        { status: 403 }
      );
    }

    // ステータスチェック（提出済みのみ承認可能）
    if (report.status !== REPORT_STATUSES.SUBMITTED) {
      return NextResponse.json(
        { error: '提出済みの日報のみ承認できます' },
        { status: 400 }
      );
    }

    // 日報を承認
    const updatedReport = await prisma.dailyReport.update({
      where: { reportId },
      data: {
        status: REPORT_STATUSES.APPROVED,
        approvedAt: new Date(),
        approvedBy: user.salesId,
        updatedAt: new Date(),
      },
      include: {
        sales: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
        approver: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: '日報を承認しました',
      report: updatedReport,
    });
  } catch (error) {
    console.error('Failed to approve report:', error);
    return NextResponse.json(
      { error: '日報の承認に失敗しました' },
      { status: 500 }
    );
  }
}
