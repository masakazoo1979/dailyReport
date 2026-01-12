'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { commentSchema } from '@/lib/validations/daily-report';
import type { DailyReport } from '@/types/daily-report';

/**
 * Fetch daily report details by ID
 *
 * Based on doc/api-specification.md GET /reports/:id
 *
 * @param reportId - Report ID
 * @returns Daily report details with visits and comments
 */
export async function fetchReportDetail(
  reportId: number
): Promise<DailyReport | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error('認証が必要です');
    }

    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      include: {
        sales: {
          select: {
            salesId: true,
            salesName: true,
            department: true,
            managerId: true,
          },
        },
        approver: {
          select: {
            salesId: true,
            salesName: true,
          },
        },
        visits: {
          include: {
            customer: {
              select: {
                customerId: true,
                customerName: true,
                companyName: true,
              },
            },
          },
          orderBy: {
            visitTime: 'asc',
          },
        },
        comments: {
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
        },
      },
    });

    if (!report) {
      return null;
    }

    // Check access permission
    const isOwner = report.salesId === session.user.salesId;
    const isManager = session.user.role === '上長';
    const isManagerOfOwner =
      isManager && report.sales.managerId === session.user.salesId;

    if (!isOwner && !isManagerOfOwner) {
      throw new Error('この日報にアクセスする権限がありません');
    }

    // Format the response
    return {
      reportId: report.reportId,
      salesId: report.salesId,
      salesName: report.sales.salesName,
      department: report.sales.department,
      reportDate: report.reportDate.toISOString().split('T')[0],
      problem: report.problem,
      plan: report.plan,
      status: report.status as '下書き' | '提出済み' | '承認済み' | '差し戻し',
      submittedAt: report.submittedAt?.toISOString() ?? null,
      approvedAt: report.approvedAt?.toISOString() ?? null,
      approvedBy: report.approvedBy,
      approvedByName: report.approver?.salesName ?? null,
      visits: report.visits.map((visit) => ({
        visitId: visit.visitId,
        reportId: visit.reportId,
        customerId: visit.customerId,
        customerName: visit.customer.customerName,
        companyName: visit.customer.companyName,
        visitTime: visit.visitTime.toString().substring(0, 5), // HH:MM format
        visitContent: visit.visitContent,
        createdAt: visit.createdAt.toISOString(),
        updatedAt: visit.updatedAt.toISOString(),
      })),
      comments: report.comments.map((comment) => ({
        commentId: comment.commentId,
        reportId: comment.reportId,
        salesId: comment.salesId,
        salesName: comment.sales.salesName,
        commentContent: comment.commentContent,
        createdAt: comment.createdAt.toISOString(),
      })),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch report detail:', error);
    throw error;
  }
}

/**
 * Post a comment to a daily report
 *
 * Based on doc/api-specification.md POST /reports/:report_id/comments
 *
 * @param reportId - Report ID
 * @param commentContent - Comment content
 * @returns Success flag with comment data or error
 */
export async function postComment(
  reportId: number,
  commentContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: '認証が必要です' };
    }

    // Validate input
    const validation = commentSchema.safeParse({ commentContent });
    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.errors[0]?.message ?? '入力内容に誤りがあります',
      };
    }

    // Check if report exists
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      select: {
        reportId: true,
        salesId: true,
        sales: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!report) {
      return { success: false, error: '日報が見つかりません' };
    }

    // Check access permission
    const isOwner = report.salesId === session.user.salesId;
    const isManager = session.user.role === '上長';
    const isManagerOfOwner =
      isManager && report.sales.managerId === session.user.salesId;

    if (!isOwner && !isManagerOfOwner) {
      return {
        success: false,
        error: 'この日報にアクセスする権限がありません',
      };
    }

    // Create comment
    await prisma.comment.create({
      data: {
        reportId,
        salesId: session.user.salesId,
        commentContent: validation.data.commentContent,
      },
    });

    // Revalidate the report detail page
    revalidatePath(`/dashboard/reports/${reportId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to post comment:', error);
    return { success: false, error: 'コメントの投稿に失敗しました' };
  }
}

/**
 * Approve a daily report (Manager only)
 *
 * Based on doc/api-specification.md POST /reports/:id/approve
 *
 * @param reportId - Report ID
 * @returns Success flag with error message if failed
 */
export async function approveReport(
  reportId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: '認証が必要です' };
    }

    // Check if user is manager
    if (session.user.role !== '上長') {
      return { success: false, error: 'この操作は上長のみ実行できます' };
    }

    // Check if report exists and is submitted
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      select: {
        reportId: true,
        salesId: true,
        status: true,
        sales: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!report) {
      return { success: false, error: '日報が見つかりません' };
    }

    // Check if manager is the owner's manager
    if (report.sales.managerId !== session.user.salesId) {
      return { success: false, error: 'この操作を実行する権限がありません' };
    }

    // Check if report status is '提出済み'
    if (report.status !== '提出済み') {
      return {
        success: false,
        error: '提出済みの日報のみ承認できます',
      };
    }

    // Update report status to '承認済み'
    await prisma.dailyReport.update({
      where: { reportId },
      data: {
        status: '承認済み',
        approvedAt: new Date(),
        approvedBy: session.user.salesId,
      },
    });

    // Revalidate the report detail page and list page
    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath('/dashboard/reports');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve report:', error);
    return { success: false, error: '日報の承認に失敗しました' };
  }
}

/**
 * Reject a daily report (Manager only)
 *
 * Based on doc/api-specification.md POST /reports/:id/reject
 *
 * @param reportId - Report ID
 * @param comment - Optional rejection comment
 * @returns Success flag with error message if failed
 */
export async function rejectReport(
  reportId: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: '認証が必要です' };
    }

    // Check if user is manager
    if (session.user.role !== '上長') {
      return { success: false, error: 'この操作は上長のみ実行できます' };
    }

    // Check if report exists and is submitted
    const report = await prisma.dailyReport.findUnique({
      where: { reportId },
      select: {
        reportId: true,
        salesId: true,
        status: true,
        sales: {
          select: {
            managerId: true,
          },
        },
      },
    });

    if (!report) {
      return { success: false, error: '日報が見つかりません' };
    }

    // Check if manager is the owner's manager
    if (report.sales.managerId !== session.user.salesId) {
      return { success: false, error: 'この操作を実行する権限がありません' };
    }

    // Check if report status is '提出済み'
    if (report.status !== '提出済み') {
      return {
        success: false,
        error: '提出済みの日報のみ差し戻しできます',
      };
    }

    // Update report status to '差し戻し'
    await prisma.dailyReport.update({
      where: { reportId },
      data: {
        status: '差し戻し',
      },
    });

    // Post rejection comment if provided
    if (comment && comment.trim()) {
      await prisma.comment.create({
        data: {
          reportId,
          salesId: session.user.salesId,
          commentContent: comment.trim(),
        },
      });
    }

    // Revalidate the report detail page and list page
    revalidatePath(`/dashboard/reports/${reportId}`);
    revalidatePath('/dashboard/reports');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject report:', error);
    return { success: false, error: '日報の差し戻しに失敗しました' };
  }
}
