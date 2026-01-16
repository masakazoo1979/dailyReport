'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Comment {
  commentId: number;
  salesId: number;
  salesName: string;
  commentContent: string;
  createdAt: string;
}

interface CommentSectionProps {
  reportId: number;
  comments: Comment[];
  currentUserId: number;
}

/**
 * コメントセクションコンポーネント
 *
 * 機能:
 * - コメント一覧の表示（新しい順）
 * - コメント投稿フォーム
 */
export function CommentSection({
  reportId,
  comments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setError('コメントを入力してください');
      return;
    }

    if (newComment.length > 1000) {
      setError('コメントは1000文字以内で入力してください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'コメントの投稿に失敗しました');
      }

      setNewComment('');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'コメントの投稿に失敗しました'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>コメント ({comments.length}件)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* コメント投稿フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="コメントを入力..."
              rows={3}
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {newComment.length}/1000
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? '投稿中...' : 'コメント投稿'}
            </Button>
          </div>
        </form>

        {/* コメント一覧 */}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだコメントはありません。
          </p>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <div
                key={comment.commentId}
                className="py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {comment.salesName}
                        {comment.salesId === currentUserId && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (自分)
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {comment.commentContent}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
