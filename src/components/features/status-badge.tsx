'use client';

import { Badge } from '@/components/ui/badge';
import { REPORT_STATUSES, type ReportStatus } from '@/lib/constants';

interface StatusBadgeProps {
  status: ReportStatus | string;
  className?: string;
}

/**
 * ステータスに応じたバッジコンポーネント
 * 日報のステータスを視覚的に表示するための共通コンポーネント
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variantMap: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    [REPORT_STATUSES.DRAFT]: 'outline',
    [REPORT_STATUSES.SUBMITTED]: 'secondary',
    [REPORT_STATUSES.APPROVED]: 'default',
    [REPORT_STATUSES.REJECTED]: 'destructive',
  };

  return (
    <Badge
      variant={variantMap[status] || 'outline'}
      className={className ?? 'shrink-0'}
    >
      {status}
    </Badge>
  );
}
