'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveReport,
  rejectReport,
} from '@/app/(dashboard)/reports/[id]/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, X } from 'lucide-react';
import type { DailyReportStatus } from '@/types/daily-report';

interface ApprovalButtonsProps {
  reportId: number;
  status: DailyReportStatus;
  userRole: '一般' | '上長';
  isManagerOfOwner: boolean;
}

/**
 * ApprovalButtons Component
 *
 * Based on doc/screen-specification.md S-005 日報詳細/承認画面
 * - RD-013: 承認ボタン（上長のみ、提出済みのみ表示）
 * - RD-014: 差し戻しボタン（上長のみ、提出済みのみ表示）
 *
 * Features:
 * - Display approve and reject buttons based on permissions
 * - Confirmation dialog for approval
 * - Rejection dialog with optional comment
 * - Optimistic UI updates
 */
export function ApprovalButtons({
  reportId,
  status,
  userRole,
  isManagerOfOwner,
}: ApprovalButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Approval dialog state
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  // Rejection dialog state
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');

  // Only show buttons if user is manager, is the owner's manager, and status is '提出済み'
  if (userRole !== '上長' || !isManagerOfOwner || status !== '提出済み') {
    return null;
  }

  const handleApprove = () => {
    setShowApprovalDialog(true);
  };

  const confirmApprove = () => {
    setError(null);

    startTransition(async () => {
      const result = await approveReport(reportId);

      if (result.success) {
        setShowApprovalDialog(false);
        router.refresh();
      } else {
        setError(result.error || '承認に失敗しました');
      }
    });
  };

  const handleReject = () => {
    setShowRejectionDialog(true);
    setRejectionComment('');
  };

  const confirmReject = () => {
    setError(null);

    startTransition(async () => {
      const result = await rejectReport(reportId, rejectionComment);

      if (result.success) {
        setShowRejectionDialog(false);
        router.refresh();
      } else {
        setError(result.error || '差し戻しに失敗しました');
      }
    });
  };

  return (
    <>
      <div className="flex gap-3">
        {/* Approve Button */}
        <Button
          onClick={handleApprove}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          承認
        </Button>

        {/* Reject Button */}
        <Button
          onClick={handleReject}
          disabled={isPending}
          variant="destructive"
        >
          <X className="mr-2 h-4 w-4" />
          差し戻し
        </Button>
      </div>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>日報を承認しますか?</DialogTitle>
            <DialogDescription>
              この日報を承認します。承認後は編集できなくなります。
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? '承認中...' : '承認する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>日報を差し戻しますか?</DialogTitle>
            <DialogDescription>
              この日報を差し戻します。修正が必要な箇所をコメントで伝えてください。
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="rejection-comment"
                className="text-sm font-medium"
              >
                コメント（任意）
              </label>
              <Textarea
                id="rejection-comment"
                placeholder="修正が必要な箇所を入力してください"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                rows={4}
                disabled={isPending}
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground">
                残り {1000 - rejectionComment.length} 文字
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectionDialog(false)}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button
              onClick={confirmReject}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? '差し戻し中...' : '差し戻す'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
