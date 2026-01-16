import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { REPORT_STATUSES, ROLES } from '@/lib/constants';

/**
 * 差し戻しのバリデーションスキーマ
 */
const rejectSchema = z.object({
  comment: z
    .string()
    .min(1, '差し戻し理由を入力してください')
    .max(1000, '差し戻し理由は1000文字以内で入力してください'),
});

/**
 * 日報差し戻しAPI
 * POST /api/reports/[id]/reject
 *
 * 日報を差し戻します（上長のみ）。
 * - ステータスを「差し戻し」に変更
 * - 差し戻し理由をコメントとして記録
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

    // 上長権限チェック
    if (user.role !== ROLES.MANAGER) {
      return NextResponse.json(
        { error: '差し戻し権限がありません' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // バリデーション
    const validation = rejectSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const { comment } = validation.data;

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

    // 自分の日報は差し戻し不可
    if (report.salesId === user.salesId) {
      return NextResponse.json(
        { error: '自分の日報は差し戻しできません' },
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
        { error: '差し戻し権限がありません' },
        { status: 403 }
      );
    }

    // ステータスチェック（提出済みのみ差し戻し可能）
    if (report.status !== REPORT_STATUSES.SUBMITTED) {
      return NextResponse.json(
        { error: '提出済みの日報のみ差し戻しできます' },
        { status: 400 }
      );
    }

    // トランザクションで日報更新とコメント作成を実行
    const result = await prisma.$transaction(async (tx) => {
      // 日報を差し戻し
      const updatedReport = await tx.dailyReport.update({
        where: { reportId },
        data: {
          status: REPORT_STATUSES.REJECTED,
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

      // 差し戻し理由をコメントとして記録
      await tx.comment.create({
        data: {
          reportId,
          salesId: user.salesId,
          commentContent: `【差し戻し】${comment}`,
        },
      });

      return updatedReport;
    });

    return NextResponse.json({
      message: '日報を差し戻しました',
      report: result,
    });
  } catch (error) {
    console.error('Failed to reject report:', error);
    return NextResponse.json(
      { error: '日報の差し戻しに失敗しました' },
      { status: 500 }
    );
  }
}
