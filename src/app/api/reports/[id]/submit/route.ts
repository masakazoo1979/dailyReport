import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { REPORT_STATUSES } from '@/lib/constants';

/**
 * 日報提出API
 * POST /api/reports/[id]/submit
 *
 * 日報を提出します。
 * - 自分の日報のみ提出可能
 * - ステータスが「下書き」または「差し戻し」の日報のみ提出可能
 * - 訪問記録が1件以上必要
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

    // 日報を取得（訪問記録の数も含める）
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      include: {
        _count: {
          select: {
            visits: true,
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

    // 権限チェック（自分の日報のみ）
    if (report.salesId !== user.salesId) {
      return NextResponse.json(
        { error: '提出権限がありません' },
        { status: 403 }
      );
    }

    // ステータスチェック（下書き・差し戻しのみ提出可能）
    if (
      report.status !== REPORT_STATUSES.DRAFT &&
      report.status !== REPORT_STATUSES.REJECTED
    ) {
      return NextResponse.json(
        { error: 'この日報は提出できません' },
        { status: 400 }
      );
    }

    // 訪問記録チェック
    if (report._count.visits === 0) {
      return NextResponse.json(
        { error: '日報を提出するには、訪問記録を1件以上登録してください' },
        { status: 422 }
      );
    }

    // 日報を提出
    const updatedReport = await prisma.dailyReport.update({
      where: { reportId },
      data: {
        status: REPORT_STATUSES.SUBMITTED,
        submittedAt: new Date(),
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

    return NextResponse.json({
      message: '日報を提出しました',
      report: updatedReport,
    });
  } catch (error) {
    console.error('Failed to submit report:', error);
    return NextResponse.json(
      { error: '日報の提出に失敗しました' },
      { status: 500 }
    );
  }
}
