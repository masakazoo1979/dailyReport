'use server';

import { prisma } from '@/lib/prisma';
import { CustomerOption } from '@/types/daily-report';

/**
 * 顧客一覧を取得するサーバーアクション
 *
 * 日報登録時の顧客選択ドロップダウン用
 *
 * @returns 顧客一覧（customerId, customerName, companyName）
 */
export async function getCustomersForSelect(): Promise<{
  success: boolean;
  data?: CustomerOption[];
  error?: string;
}> {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        customerId: true,
        customerName: true,
        companyName: true,
      },
      orderBy: [{ companyName: 'asc' }, { customerName: 'asc' }],
    });

    return {
      success: true,
      data: customers,
    };
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return {
      success: false,
      error: 'システムエラーが発生しました。管理者にお問い合わせください。',
    };
  }
}
