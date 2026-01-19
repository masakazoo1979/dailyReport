import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * コメント削除API
 * DELETE /api/comments/[id]
 *
 * コメントを削除します。
 * - 自分が投稿したコメントのみ削除可能
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
    const commentId = parseInt(params.id, 10);

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: 'コメントIDが不正です' },
        { status: 400 }
      );
    }

    // コメントの存在確認
    const comment = await prisma.comment.findUnique({
      where: { commentId },
      select: {
        commentId: true,
        salesId: true,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'コメントが見つかりません' },
        { status: 404 }
      );
    }

    // 権限チェック（投稿者のみ削除可能）
    if (comment.salesId !== user.salesId) {
      return NextResponse.json(
        { error: '自分のコメントのみ削除できます' },
        { status: 403 }
      );
    }

    // コメント削除
    await prisma.comment.delete({
      where: { commentId },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json(
      { error: 'コメントの削除に失敗しました' },
      { status: 500 }
    );
  }
}
