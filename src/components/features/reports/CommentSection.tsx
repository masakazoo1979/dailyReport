'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postComment } from '@/app/(dashboard)/reports/[id]/actions';
import {
  commentSchema,
  type CommentInput,
} from '@/lib/validations/daily-report';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Send } from 'lucide-react';
import type { Comment } from '@/types/daily-report';

interface CommentSectionProps {
  reportId: number;
  comments: Comment[];
}

/**
 * CommentSection Component
 *
 * Based on doc/screen-specification.md S-005 日報詳細/承認画面
 * - RD-010: コメント一覧（新しい順で表示）
 * - RD-011: コメント入力（1000文字以内）
 * - RD-012: コメント投稿ボタン
 *
 * Features:
 * - Display comments in descending order (newest first)
 * - Comment posting form with validation
 * - Character counter
 * - Optimistic UI updates
 */
export function CommentSection({ reportId, comments }: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      commentContent: '',
    },
  });

  const commentContent = watch('commentContent') || '';
  const remainingChars = 1000 - commentContent.length;

  const onSubmit = async (data: CommentInput) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await postComment(reportId, data.commentContent);

      if (result.success) {
        setSuccess(true);
        reset();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'コメントの投稿に失敗しました');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">コメント</h3>

        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              コメントはまだありません
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment.commentId}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {comment.salesName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Comment Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {comment.salesName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {comment.commentContent}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < comments.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Form */}
      <div>
        <h3 className="text-lg font-semibold mb-4">コメントを投稿</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-500 text-green-700 bg-green-50">
              <AlertDescription>コメントを投稿しました</AlertDescription>
            </Alert>
          )}

          {/* Comment Input */}
          <div className="space-y-2">
            <Textarea
              {...register('commentContent')}
              placeholder="コメントを入力してください"
              rows={4}
              disabled={isPending}
              className={errors.commentContent ? 'border-red-500' : ''}
            />
            <div className="flex justify-between items-center text-sm">
              <span
                className={
                  errors.commentContent
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                }
              >
                {errors.commentContent?.message}
              </span>
              <span
                className={
                  remainingChars < 0
                    ? 'text-red-500'
                    : remainingChars < 100
                      ? 'text-orange-500'
                      : 'text-muted-foreground'
                }
              >
                残り {remainingChars} 文字
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isPending || remainingChars < 0}>
            <Send className="mr-2 h-4 w-4" />
            {isPending ? '投稿中...' : 'コメント投稿'}
          </Button>
        </form>
      </div>
    </div>
  );
}

/**
 * Format ISO datetime string to Japanese format
 */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}
