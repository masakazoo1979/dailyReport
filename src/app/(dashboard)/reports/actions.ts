'use server';

/**
 * Server Actions for Reports List
 *
 * Based on:
 * - doc/screen-specification.md S-003 日報一覧画面
 * - doc/api-specification.md GET /reports
 */

import { prisma } from '@/lib/prisma';
import {
  reportsFilterSchema,
  type ReportsListResponse,
  type SalesOption,
} from '@/lib/validations/reports';
import { Prisma } from '@prisma/client';

/**
 * Fetch reports list with filters and pagination
 *
 * Access Control:
 * - 一般営業: Only their own reports
 * - 上長: Reports of subordinate members
 *
 * @param params - Filter parameters from URL search params
 * @param currentUser - Current logged-in user information
 * @returns Reports list with pagination
 */
export async function fetchReports(
  params: URLSearchParams,
  currentUser: {
    salesId: number;
    role: '一般' | '上長';
    managerId?: number | null;
  }
): Promise<ReportsListResponse> {
  try {
    // Parse and validate filter parameters
    const rawFilters = {
      startDate: params.get('startDate') || undefined,
      endDate: params.get('endDate') || undefined,
      salesId: params.get('salesId') || undefined,
      status: params.get('status') || undefined,
      page: params.get('page') || '1',
      perPage: params.get('perPage') || '20',
      sort: params.get('sort') || 'report_date',
      order: params.get('order') || 'desc',
    };

    const filters = reportsFilterSchema.parse(rawFilters);

    // Build WHERE clause based on role and filters
    const where: Prisma.DailyReportWhereInput = {};

    // Role-based access control
    if (currentUser.role === '一般') {
      // 一般営業: Only own reports
      where.salesId = currentUser.salesId;
    } else if (currentUser.role === '上長') {
      // 上長: Own reports + subordinate reports
      if (filters.salesId) {
        // Specific sales person filter
        where.salesId = filters.salesId;
      } else {
        // All subordinates (need to implement subordinate query)
        // For now, allow viewing all reports for managers
        // TODO: Implement proper subordinate filtering
      }
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.reportDate = {};
      if (filters.startDate) {
        where.reportDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.reportDate.lte = new Date(filters.endDate);
      }
    }

    // Status filter
    if (filters.status && filters.status !== 'すべて') {
      where.status = filters.status;
    }

    // Count total records
    const total = await prisma.dailyReport.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / filters.perPage);
    const skip = (filters.page - 1) * filters.perPage;

    // Build ORDER BY clause
    const orderBy: Prisma.DailyReportOrderByWithRelationInput = {};
    if (filters.sort === 'sales_name') {
      orderBy.sales = { salesName: filters.order };
    } else if (filters.sort === 'report_date') {
      orderBy.reportDate = filters.order;
    } else if (filters.sort === 'status') {
      orderBy.status = filters.order;
    } else if (filters.sort === 'submitted_at') {
      orderBy.submittedAt = filters.order;
    }

    // Fetch reports with related data
    const reports = await prisma.dailyReport.findMany({
      where,
      orderBy,
      skip,
      take: filters.perPage,
      include: {
        sales: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
        approver: {
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
    });

    // Transform data to match API response format
    const data = reports.map((report) => ({
      report_id: report.reportId,
      sales_id: report.salesId,
      sales_name: report.sales.salesName,
      report_date: report.reportDate.toISOString().split('T')[0],
      status: report.status as '下書き' | '提出済み' | '承認済み' | '差し戻し',
      submitted_at: report.submittedAt?.toISOString() || null,
      approved_at: report.approvedAt?.toISOString() || null,
      approved_by: report.approvedBy,
      visit_count: report._count.visits,
      comment_count: report._count.comments,
      created_at: report.createdAt.toISOString(),
      updated_at: report.updatedAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        total,
        page: filters.page,
        per_page: filters.perPage,
        total_pages: totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw new Error('日報の取得中にエラーが発生しました');
  }
}

/**
 * Fetch sales persons list for filter dropdown (managers only)
 *
 * @param currentUser - Current logged-in user information
 * @returns List of sales persons as select options
 */
export async function fetchSalesOptions(currentUser: {
  salesId: number;
  role: '一般' | '上長';
}): Promise<SalesOption[]> {
  try {
    // Only managers can see this list
    if (currentUser.role !== '上長') {
      return [];
    }

    // Fetch all sales persons (including self and subordinates)
    // TODO: Filter only subordinates based on manager relationship
    const salesList = await prisma.sales.findMany({
      select: {
        salesId: true,
        salesName: true,
      },
      orderBy: {
        salesName: 'asc',
      },
    });

    return salesList.map((sales) => ({
      value: sales.salesId,
      label: sales.salesName,
    }));
  } catch (error) {
    console.error('Error fetching sales options:', error);
    throw new Error('営業担当者リストの取得中にエラーが発生しました');
  }
}
