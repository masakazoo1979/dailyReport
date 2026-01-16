'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type ReportStatus } from '@/lib/constants';

interface ReportDetailActionsProps {
  reportId: number;
  currentStatus: ReportStatus;
}

/**
 * 日報詳細画面のアクションコンポーネント（承認・差し戻し）
 *
 * 上長のみが使用可能
 * - 承認: ステータスを「承認済み」に変更
 * - 差し戻し: ステータスを「差し戻し」に変更（コメント必須）
 */
export function ReportDetailActions({
  reportId,
  currentStatus,
}: ReportDetailActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '承認に失敗しました');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '承認に失敗しました');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      setError('差し戻し理由を入力してください');
      return;
    }

    setIsRejecting(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: rejectComment }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '差し戻しに失敗しました');
      }

      setShowRejectDialog(false);
      setRejectComment('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '差し戻しに失敗しました');
    } finally {
      setIsRejecting(false);
    }
  };

  if (currentStatus !== '提出済み') {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>承認アクション</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <Button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? '承認中...' : '承認'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              disabled={isApproving || isRejecting}
            >
              差し戻し
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 差し戻しダイアログ */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>日報を差し戻す</DialogTitle>
            <DialogDescription>
              差し戻し理由を入力してください。入力した内容はコメントとして記録されます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectComment">差し戻し理由</Label>
              <Textarea
                id="rejectComment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="差し戻し理由を入力してください"
                className="mt-2"
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectComment('');
                setError(null);
              }}
              disabled={isRejecting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectComment.trim()}
            >
              {isRejecting ? '差し戻し中...' : '差し戻す'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
