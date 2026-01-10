import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Statistics Card Component
 *
 * Displays a single statistic with title, value, and optional icon
 * Used in dashboard to show monthly statistics
 */

export interface StatsCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: number;
  /** Optional description text */
  description?: string;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Optional icon color class */
  iconColor?: string;
  /** Optional card color accent */
  variant?: 'default' | 'primary' | 'success' | 'warning';
  /** Optional className for custom styling */
  className?: string;
}

/**
 * StatsCard Component
 *
 * A reusable card component for displaying dashboard statistics
 * Follows shadcn/ui card patterns with Tailwind CSS styling
 */
export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  variant = 'default',
  className,
}: StatsCardProps) {
  // Variant-specific styles
  const variantStyles = {
    default: '',
    primary: 'border-primary/20 bg-primary/5',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={cn('h-4 w-4', iconColor)} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
