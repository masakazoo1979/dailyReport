import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ROLES } from '@/lib/constants';

/**
 * コメント投稿のバリデーションスキーマ
 */
const createCommentSchema = z.object({
  comment_content: z
    .string()
    .min(1, 'コメントを入力してください')
    .max(1000, 'コメントは1000文字以内で入力してください'),
});

/**
 * コメント一覧取得API
 * GET /api/reports/[id]/comments
 *
 * 日報に紐づくコメント一覧を取得します。
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
      const allowedIds = [user.salesId, ...subordinates.map((s) => s.salesId)];
      hasAccess = allowedIds.includes(report.salesId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: '閲覧権限がありません' },
        { status: 403 }
      );
    }

    // コメント取得
    const comments = await prisma.comment.findMany({
      where: { reportId },
      include: {
        sales: {
          select: {
            salesId: true,
            salesName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // レスポンス形式を整形（API仕様書に準拠）
    const data = comments.map((comment) => ({
      comment_id: comment.commentId,
      report_id: comment.reportId,
      sales_id: comment.sales.salesId,
      sales_name: comment.sales.salesName,
      role: comment.sales.role,
      comment_content: comment.commentContent,
      created_at: comment.createdAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * コメント投稿API
 * POST /api/reports/[id]/comments
 *
 * 日報にコメントを投稿します。
 * - 一般営業: 自分の日報のみ投稿可能
 * - 上長: 自分と配下メンバーの日報に投稿可能
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

    // バリデーション
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message;
      return NextResponse.json(
        { error: errorMessage || '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    const { comment_content } = validation.data;

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
      const allowedIds = [user.salesId, ...subordinates.map((s) => s.salesId)];
      hasAccess = allowedIds.includes(report.salesId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'コメント投稿権限がありません' },
        { status: 403 }
      );
    }

    // コメント作成
    const comment = await prisma.comment.create({
      data: {
        reportId,
        salesId: user.salesId,
        commentContent: comment_content,
      },
      include: {
        sales: {
          select: {
            salesId: true,
            salesName: true,
            role: true,
          },
        },
      },
    });

    // レスポンス形式を整形（API仕様書に準拠）
    const data = {
      comment_id: comment.commentId,
      report_id: comment.reportId,
      sales_id: comment.sales.salesId,
      sales_name: comment.sales.salesName,
      role: comment.sales.role,
      comment_content: comment.commentContent,
      created_at: comment.createdAt.toISOString(),
    };

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    );
  }
}
