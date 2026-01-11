/**
 * Reports types
 *
 * Type definitions for the Daily Reports feature
 * Based on doc/screen-specification.md and doc/api-specification.md
 */

import {
  ReportStatus,
  ReportListItem,
  PaginationInfo,
  SalesOption,
  ReportsFilter,
} from '@/lib/validations/reports';

// Re-export validation types for convenience
export type {
  ReportStatus,
  ReportListItem,
  PaginationInfo,
  SalesOption,
  ReportsFilter,
};

/**
 * Reports table sort configuration
 */
export interface ReportsSortConfig {
  field: 'report_date' | 'status' | 'sales_name' | 'submitted_at';
  order: 'asc' | 'desc';
}

/**
 * Reports filter form values
 */
export interface ReportsFilterFormValues {
  startDate?: string;
  endDate?: string;
  salesId?: number;
  status?: ReportStatus | 'すべて';
}

/**
 * Reports list page props
 */
export interface ReportsListPageProps {
  searchParams?: {
    page?: string;
    perPage?: string;
    startDate?: string;
    endDate?: string;
    salesId?: string;
    status?: string;
    sort?: string;
    order?: string;
  };
}

/**
 * Status badge configuration
 */
export interface StatusBadgeConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}
