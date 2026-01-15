import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReportSchema } from '@/lib/validations/report';
import { REPORT_STATUSES } from '@/lib/constants';

/**
 * 日報作成API
 * POST /api/reports
 *
 * 日報を新規作成します。
 * - 下書き保存: 訪問記録なしでも保存可能
 * - 提出: 訪問記録が1件以上必要（クライアント側でバリデーション）
 * - 同日の日報が既に存在する場合はエラー
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();

    // バリデーション
    const validation = createReportSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const { reportDate, problem, plan, status, visits } = validation.data;

    // 日付をパース
    const parsedDate = new Date(reportDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: '報告日の形式が正しくありません' },
        { status: 400 }
      );
    }

    // 同日の日報が既に存在するかチェック
    const existingReport = await prisma.dailyReport.findUnique({
      where: {
        salesId_reportDate: {
          salesId: user.salesId,
          reportDate: parsedDate,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'この日付の日報は既に登録されています' },
        { status: 409 }
      );
    }

    // トランザクションで日報と訪問記録を作成
    const result = await prisma.$transaction(async (tx) => {
      // 日報を作成
      const report = await tx.dailyReport.create({
        data: {
          salesId: user.salesId,
          reportDate: parsedDate,
          problem: problem || null,
          plan: plan || null,
          status,
          submittedAt: status === REPORT_STATUSES.SUBMITTED ? new Date() : null,
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

    return NextResponse.json(
      {
        message: '日報を作成しました',
        report: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create report:', error);

    // Prismaのユニーク制約エラーを処理
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'この日付の日報は既に登録されています' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: '日報の作成に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 日報一覧取得API
 * GET /api/reports
 *
 * 権限に応じて日報の一覧を取得します。
 * - 一般営業: 自分の日報のみ
 * - 上長: 自分と配下メンバーの日報
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const salesId = searchParams.get('salesId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'reportDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 権限に基づいた検索条件の構築
    let salesIdCondition: number | { in: number[] } | undefined;

    if (user.role === '上長') {
      // 上長の場合: 配下メンバー + 自分
      const subordinates = await prisma.sales.findMany({
        where: { managerId: user.salesId },
        select: { salesId: true },
      });

      const subordinateIds = subordinates.map((s) => s.salesId);
      const allowedIds = [user.salesId, ...subordinateIds];

      if (salesId && allowedIds.includes(parseInt(salesId, 10))) {
        salesIdCondition = parseInt(salesId, 10);
      } else {
        salesIdCondition = { in: allowedIds };
      }
    } else {
      // 一般営業の場合: 自分の日報のみ
      salesIdCondition = user.salesId;
    }

    // 検索条件の構築
    const where: any = {
      salesId: salesIdCondition,
    };

    if (startDate) {
      where.reportDate = {
        ...where.reportDate,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.reportDate = {
        ...where.reportDate,
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    // ソート条件の構築
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    };

    // データ取得
    const [reports, totalCount] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        include: {
          sales: {
            select: {
              salesId: true,
              salesName: true,
            },
          },
          _count: {
            select: {
              visits: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dailyReport.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: '日報一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
