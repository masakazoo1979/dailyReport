import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 営業担当者データの作成（上長1名、一般営業2名）
  const manager = await prisma.sales.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      salesName: '山田 太郎',
      email: 'manager@example.com',
      password: hashedPassword,
      department: '営業部',
      role: '上長',
    },
  });
  console.log(`Created manager: ${manager.salesName}`);

  const sales1 = await prisma.sales.upsert({
    where: { email: 'sales1@example.com' },
    update: {},
    create: {
      salesName: '鈴木 一郎',
      email: 'sales1@example.com',
      password: hashedPassword,
      department: '営業部',
      role: '一般',
      managerId: manager.salesId,
    },
  });
  console.log(`Created sales: ${sales1.salesName}`);

  const sales2 = await prisma.sales.upsert({
    where: { email: 'sales2@example.com' },
    update: {},
    create: {
      salesName: '佐藤 花子',
      email: 'sales2@example.com',
      password: hashedPassword,
      department: '営業部',
      role: '一般',
      managerId: manager.salesId,
    },
  });
  console.log(`Created sales: ${sales2.salesName}`);

  // 顧客データの作成（5件以上）
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { customerId: 1 },
      update: {},
      create: {
        customerName: '田中 健太',
        companyName: '株式会社ABC商事',
        industry: '商社',
        phone: '03-1234-5678',
        email: 'tanaka@abc-shoji.example.com',
        address: '東京都千代田区丸の内1-1-1',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 2 },
      update: {},
      create: {
        customerName: '高橋 美咲',
        companyName: 'XYZ製造株式会社',
        industry: '製造業',
        phone: '06-9876-5432',
        email: 'takahashi@xyz-mfg.example.com',
        address: '大阪府大阪市北区梅田2-2-2',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 3 },
      update: {},
      create: {
        customerName: '伊藤 大輔',
        companyName: 'テックソリューション株式会社',
        industry: 'IT',
        phone: '045-111-2222',
        email: 'ito@techsol.example.com',
        address: '神奈川県横浜市西区みなとみらい3-3-3',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 4 },
      update: {},
      create: {
        customerName: '渡辺 さくら',
        companyName: 'グローバル物流株式会社',
        industry: '物流',
        phone: '052-333-4444',
        email: 'watanabe@global-logistics.example.com',
        address: '愛知県名古屋市中区栄4-4-4',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 5 },
      update: {},
      create: {
        customerName: '中村 翔太',
        companyName: 'ファイナンスパートナーズ株式会社',
        industry: '金融',
        phone: '092-555-6666',
        email: 'nakamura@finance-partners.example.com',
        address: '福岡県福岡市博多区博多駅前5-5-5',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 6 },
      update: {},
      create: {
        customerName: '小林 由美',
        companyName: 'ヘルスケアジャパン株式会社',
        industry: '医療',
        phone: '011-777-8888',
        email: 'kobayashi@healthcare-jp.example.com',
        address: '北海道札幌市中央区大通6-6-6',
      },
    }),
  ]);
  console.log(`Created ${customers.length} customers`);

  // 日報データの作成（各ステータスのサンプル）
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // 下書き日報
  await prisma.dailyReport.upsert({
    where: {
      salesId_reportDate: {
        salesId: sales1.salesId,
        reportDate: today,
      },
    },
    update: {},
    create: {
      salesId: sales1.salesId,
      reportDate: today,
      problem: '新規顧客への提案内容を検討中です。',
      plan: '明日は既存顧客へのフォローアップ訪問を予定しています。',
      status: '下書き',
    },
  });
  console.log(`Created draft report for ${sales1.salesName}`);

  // 提出済み日報
  const submittedReport = await prisma.dailyReport.upsert({
    where: {
      salesId_reportDate: {
        salesId: sales1.salesId,
        reportDate: yesterday,
      },
    },
    update: {},
    create: {
      salesId: sales1.salesId,
      reportDate: yesterday,
      problem: '競合他社の提案があり、差別化ポイントの説明が必要でした。',
      plan: '価格交渉の準備と上長への相談を予定しています。',
      status: '提出済み',
      submittedAt: yesterday,
    },
  });
  console.log(`Created submitted report for ${sales1.salesName}`);

  // 承認済み日報
  const approvedReport = await prisma.dailyReport.upsert({
    where: {
      salesId_reportDate: {
        salesId: sales2.salesId,
        reportDate: yesterday,
      },
    },
    update: {},
    create: {
      salesId: sales2.salesId,
      reportDate: yesterday,
      problem: 'なし',
      plan: '新規開拓のためのテレアポを実施予定。',
      status: '承認済み',
      submittedAt: yesterday,
      approvedAt: today,
      approvedBy: manager.salesId,
    },
  });
  console.log(`Created approved report for ${sales2.salesName}`);

  // 差し戻し日報
  const rejectedReport = await prisma.dailyReport.upsert({
    where: {
      salesId_reportDate: {
        salesId: sales2.salesId,
        reportDate: twoDaysAgo,
      },
    },
    update: {},
    create: {
      salesId: sales2.salesId,
      reportDate: twoDaysAgo,
      problem: '内容を記載してください。',
      plan: '詳細な計画を記載してください。',
      status: '差し戻し',
      submittedAt: twoDaysAgo,
    },
  });
  console.log(`Created rejected report for ${sales2.salesName}`);

  // 訪問記録データの作成
  const visits = await Promise.all([
    prisma.visit.create({
      data: {
        reportId: submittedReport.reportId,
        customerId: customers[0].customerId,
        visitContent:
          '新製品の紹介とデモンストレーションを実施しました。先方は非常に関心を示されており、来週の見積り提出を依頼されました。',
        visitTime: new Date('1970-01-01T10:00:00'),
      },
    }),
    prisma.visit.create({
      data: {
        reportId: submittedReport.reportId,
        customerId: customers[1].customerId,
        visitContent:
          '既存契約の更新について打ち合わせを行いました。契約条件の見直しを検討したいとのことで、次回具体的な提案を持参することになりました。',
        visitTime: new Date('1970-01-01T14:30:00'),
      },
    }),
    prisma.visit.create({
      data: {
        reportId: approvedReport.reportId,
        customerId: customers[2].customerId,
        visitContent:
          'ITシステムの導入について初回ヒアリングを実施。現状の課題と要望を詳しく伺いました。RFPへの参加を依頼されました。',
        visitTime: new Date('1970-01-01T11:00:00'),
      },
    }),
    prisma.visit.create({
      data: {
        reportId: approvedReport.reportId,
        customerId: customers[3].customerId,
        visitContent:
          '物流効率化の提案書を説明しました。費用対効果について追加の資料を求められました。',
        visitTime: new Date('1970-01-01T15:00:00'),
      },
    }),
  ]);
  console.log(`Created ${visits.length} visits`);

  // コメントデータの作成
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        reportId: submittedReport.reportId,
        salesId: manager.salesId,
        commentContent:
          '競合対策について、明日のミーティングで詳しく相談しましょう。価格以外の差別化ポイントを整理しておいてください。',
      },
    }),
    prisma.comment.create({
      data: {
        reportId: submittedReport.reportId,
        salesId: sales1.salesId,
        commentContent:
          '承知しました。技術面での優位性と導入後のサポート体制について資料をまとめておきます。',
      },
    }),
    prisma.comment.create({
      data: {
        reportId: approvedReport.reportId,
        salesId: manager.salesId,
        commentContent:
          '良い活動ですね。RFPに向けてしっかり準備しましょう。何かあれば相談してください。',
      },
    }),
    prisma.comment.create({
      data: {
        reportId: rejectedReport.reportId,
        salesId: manager.salesId,
        commentContent:
          '報告内容が不十分です。訪問先と商談内容を具体的に記載してください。',
      },
    }),
  ]);
  console.log(`Created ${comments.length} comments`);

  console.log('Seeding completed successfully!');
  console.log('\n--- Test User Credentials ---');
  console.log('Manager: manager@example.com / password123');
  console.log('Sales 1: sales1@example.com / password123');
  console.log('Sales 2: sales2@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
