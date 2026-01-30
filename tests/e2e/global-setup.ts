import { PrismaClient } from '@prisma/client';

/**
 * E2Eテスト用グローバルセットアップ
 * テスト実行前にsales1の今日の日報を削除して、テストの競合を防ぐ
 */
async function globalSetup() {
  console.log('[Global Setup] Starting E2E test setup...');

  const prisma = new PrismaClient();

  try {
    // sales1ユーザーを取得
    const sales1 = await prisma.sales.findUnique({
      where: { email: 'sales1@example.com' },
    });

    if (sales1) {
      // 今日の日付を取得（時刻を00:00:00に設定）
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 今日と明日以降の日報を削除（テストで作成される可能性がある）
      const deleted = await prisma.dailyReport.deleteMany({
        where: {
          salesId: sales1.salesId,
          reportDate: {
            gte: today,
          },
        },
      });

      console.log(
        `[Global Setup] Deleted ${deleted.count} report(s) for sales1 (today and future)`
      );
    }

    console.log('[Global Setup] E2E test setup completed');
  } catch (error) {
    console.error('[Global Setup] Error during setup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
