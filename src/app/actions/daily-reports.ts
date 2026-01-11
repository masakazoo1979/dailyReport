'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  dailyReportSchema,
  dailyReportSubmitSchema,
} from '@/lib/validations/daily-report';

/**
 * 日報作成（下書き保存）のサーバーアクション
 *
 * @param formData - フォームデータ
 * @returns 成功時は日報ID、失敗時はエラーメッセージ
 */
export async function saveDraftDailyReport(formData: FormData) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.salesId) {
      return {
        error: '認証エラーです。再度ログインしてください。',
      };
    }

    // FormDataからデータを取得
    const reportDate = formData.get('reportDate') as string;
    const problem = formData.get('problem') as string;
    const plan = formData.get('plan') as string;
    const visitsJson = formData.get('visits') as string;

    // 訪問記録のパース
    let visits = [];
    try {
      visits = visitsJson ? JSON.parse(visitsJson) : [];
    } catch {
      visits = [];
    }

    // バリデーション（下書きは訪問記録なしでもOK）
    const validatedFields = dailyReportSchema.safeParse({
      reportDate,
      problem: problem || null,
      plan: plan || null,
      visits,
    });

    if (!validatedFields.success) {
      const firstError = validatedFields.error.errors[0];
      return {
        error: firstError.message || '入力内容に誤りがあります',
      };
    }

    // 同日の日報重複チェック
    const existingReport = await prisma.dailyReport.findUnique({
      where: {
        salesId_reportDate: {
          salesId: session.user.salesId,
          reportDate: new Date(validatedFields.data.reportDate),
        },
      },
    });

    if (existingReport) {
      return {
        error: '同じ日付の日報が既に存在します', // E-008
      };
    }

    // トランザクション: 日報作成 + 訪問記録作成
    const dailyReport = await prisma.$transaction(async (tx) => {
      // 日報作成
      const report = await tx.dailyReport.create({
        data: {
          salesId: session.user.salesId,
          reportDate: new Date(validatedFields.data.reportDate),
          problem: validatedFields.data.problem,
          plan: validatedFields.data.plan,
          status: '下書き',
        },
      });

      // 訪問記録作成
      if (validatedFields.data.visits.length > 0) {
        await tx.visit.createMany({
          data: validatedFields.data.visits.map((visit) => ({
            reportId: report.reportId,
            customerId: visit.customerId,
            visitTime: visit.visitTime,
            visitContent: visit.visitContent,
          })),
        });
      }

      return report;
    });

    // キャッシュ再検証
    revalidatePath('/dashboard/reports');
    revalidatePath('/dashboard');

    return {
      success: true,
      reportId: dailyReport.reportId,
    };
  } catch (error) {
    console.error('Failed to save draft daily report:', error);
    return {
      error: 'システムエラーが発生しました。管理者にお問い合わせください。',
    };
  }
}

/**
 * 日報提出のサーバーアクション
 *
 * @param formData - フォームデータ
 * @returns 成功時は日報ID、失敗時はエラーメッセージ
 */
export async function submitDailyReport(formData: FormData) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.salesId) {
      return {
        error: '認証エラーです。再度ログインしてください。',
      };
    }

    // FormDataからデータを取得
    const reportDate = formData.get('reportDate') as string;
    const problem = formData.get('problem') as string;
    const plan = formData.get('plan') as string;
    const visitsJson = formData.get('visits') as string;

    // 訪問記録のパース
    let visits = [];
    try {
      visits = visitsJson ? JSON.parse(visitsJson) : [];
    } catch {
      visits = [];
    }

    // バリデーション（提出は訪問記録1件以上必須）
    const validatedFields = dailyReportSubmitSchema.safeParse({
      reportDate,
      problem: problem || null,
      plan: plan || null,
      visits,
    });

    if (!validatedFields.success) {
      const firstError = validatedFields.error.errors[0];
      return {
        error: firstError.message || '入力内容に誤りがあります',
      };
    }

    // 同日の日報重複チェック
    const existingReport = await prisma.dailyReport.findUnique({
      where: {
        salesId_reportDate: {
          salesId: session.user.salesId,
          reportDate: new Date(validatedFields.data.reportDate),
        },
      },
    });

    if (existingReport) {
      return {
        error: '同じ日付の日報が既に存在します', // E-008
      };
    }

    // トランザクション: 日報作成 + 訪問記録作成
    const dailyReport = await prisma.$transaction(async (tx) => {
      // 日報作成
      const report = await tx.dailyReport.create({
        data: {
          salesId: session.user.salesId,
          reportDate: new Date(validatedFields.data.reportDate),
          problem: validatedFields.data.problem,
          plan: validatedFields.data.plan,
          status: '提出済み',
          submittedAt: new Date(),
        },
      });

      // 訪問記録作成
      if (validatedFields.data.visits.length > 0) {
        await tx.visit.createMany({
          data: validatedFields.data.visits.map((visit) => ({
            reportId: report.reportId,
            customerId: visit.customerId,
            visitTime: visit.visitTime,
            visitContent: visit.visitContent,
          })),
        });
      }

      return report;
    });

    // キャッシュ再検証
    revalidatePath('/dashboard/reports');
    revalidatePath('/dashboard');

    return {
      success: true,
      reportId: dailyReport.reportId,
    };
  } catch (error) {
    console.error('Failed to submit daily report:', error);
    return {
      error: 'システムエラーが発生しました。管理者にお問い合わせください。',
    };
  }
}

/**
 * 日報更新（下書き保存）のサーバーアクション
 *
 * @param reportId - 日報ID
 * @param formData - フォームデータ
 * @returns 成功時はtrue、失敗時はエラーメッセージ
 */
export async function updateDraftDailyReport(
  reportId: number,
  formData: FormData
) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.salesId) {
      return {
        error: '認証エラーです。再度ログインしてください。',
      };
    }

    // 既存の日報を取得
    const existingReport = await prisma.dailyReport.findUnique({
      where: { reportId },
      include: { visits: true },
    });

    if (!existingReport) {
      return {
        error: '日報が見つかりません',
      };
    }

    // 権限チェック（自分の日報のみ編集可能）
    if (existingReport.salesId !== session.user.salesId) {
      return {
        error: 'この日報を編集する権限がありません',
      };
    }

    // ステータスチェック（下書きまたは差し戻しのみ編集可能）
    if (
      existingReport.status !== '下書き' &&
      existingReport.status !== '差し戻し'
    ) {
      return {
        error: 'この日報は編集できません',
      };
    }

    // FormDataからデータを取得
    const problem = formData.get('problem') as string;
    const plan = formData.get('plan') as string;
    const visitsJson = formData.get('visits') as string;

    // 訪問記録のパース
    let visits = [];
    try {
      visits = visitsJson ? JSON.parse(visitsJson) : [];
    } catch {
      visits = [];
    }

    // トランザクション: 日報更新 + 訪問記録更新
    await prisma.$transaction(async (tx) => {
      // 日報更新
      await tx.dailyReport.update({
        where: { reportId },
        data: {
          problem: problem || null,
          plan: plan || null,
        },
      });

      // 既存の訪問記録を削除
      await tx.visit.deleteMany({
        where: { reportId },
      });

      // 新しい訪問記録を作成
      if (visits.length > 0) {
        await tx.visit.createMany({
          data: visits.map((visit: any) => ({
            reportId,
            customerId: visit.customerId,
            visitTime: visit.visitTime,
            visitContent: visit.visitContent,
          })),
        });
      }
    });

    // キャッシュ再検証
    revalidatePath('/dashboard/reports');
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/reports/${reportId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to update draft daily report:', error);
    return {
      error: 'システムエラーが発生しました。管理者にお問い合わせください。',
    };
  }
}

/**
 * 日報更新して提出するサーバーアクション
 *
 * @param reportId - 日報ID
 * @param formData - フォームデータ
 * @returns 成功時はtrue、失敗時はエラーメッセージ
 */
export async function updateAndSubmitDailyReport(
  reportId: number,
  formData: FormData
) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.salesId) {
      return {
        error: '認証エラーです。再度ログインしてください。',
      };
    }

    // 既存の日報を取得
    const existingReport = await prisma.dailyReport.findUnique({
      where: { reportId },
      include: { visits: true },
    });

    if (!existingReport) {
      return {
        error: '日報が見つかりません',
      };
    }

    // 権限チェック（自分の日報のみ編集可能）
    if (existingReport.salesId !== session.user.salesId) {
      return {
        error: 'この日報を編集する権限がありません',
      };
    }

    // ステータスチェック（下書きまたは差し戻しのみ編集可能）
    if (
      existingReport.status !== '下書き' &&
      existingReport.status !== '差し戻し'
    ) {
      return {
        error: 'この日報は編集できません',
      };
    }

    // FormDataからデータを取得
    const problem = formData.get('problem') as string;
    const plan = formData.get('plan') as string;
    const visitsJson = formData.get('visits') as string;

    // 訪問記録のパース
    let visits = [];
    try {
      visits = visitsJson ? JSON.parse(visitsJson) : [];
    } catch {
      visits = [];
    }

    // 訪問記録必須チェック
    if (visits.length === 0) {
      return {
        error: '日報を提出するには、訪問記録を1件以上登録してください', // E-016
      };
    }

    // トランザクション: 日報更新 + 訪問記録更新
    await prisma.$transaction(async (tx) => {
      // 日報更新
      await tx.dailyReport.update({
        where: { reportId },
        data: {
          problem: problem || null,
          plan: plan || null,
          status: '提出済み',
          submittedAt: new Date(),
        },
      });

      // 既存の訪問記録を削除
      await tx.visit.deleteMany({
        where: { reportId },
      });

      // 新しい訪問記録を作成
      await tx.visit.createMany({
        data: visits.map((visit: any) => ({
          reportId,
          customerId: visit.customerId,
          visitTime: visit.visitTime,
          visitContent: visit.visitContent,
        })),
      });
    });

    // キャッシュ再検証
    revalidatePath('/dashboard/reports');
    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/reports/${reportId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to update and submit daily report:', error);
    return {
      error: 'システムエラーが発生しました。管理者にお問い合わせください。',
    };
  }
}
