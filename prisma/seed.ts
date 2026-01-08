import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // パスワードのハッシュ化
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 営業担当者データの作成
  console.log('📝 Creating sales...');

  // 上長
  const manager = await prisma.sales.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      salesName: '山田太郎',
      email: 'manager@example.com',
      password: hashedPassword,
      department: '営業一部',
      role: '上長',
    },
  });

  // 一般営業1
  const sales1 = await prisma.sales.upsert({
    where: { email: 'sales1@example.com' },
    update: {},
    create: {
      salesName: '佐藤花子',
      email: 'sales1@example.com',
      password: hashedPassword,
      department: '営業一部',
      role: '一般',
      managerId: manager.salesId,
    },
  });

  // 一般営業2
  const sales2 = await prisma.sales.upsert({
    where: { email: 'sales2@example.com' },
    update: {},
    create: {
      salesName: '鈴木一郎',
      email: 'sales2@example.com',
      password: hashedPassword,
      department: '営業一部',
      role: '一般',
      managerId: manager.salesId,
    },
  });

  console.log(`✅ Created ${3} sales users`);

  // 顧客データの作成
  console.log('📝 Creating customers...');

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { customerId: 1 },
      update: {},
      create: {
        customerName: '田中次郎',
        companyName: '株式会社テクノロジー',
        industry: 'IT',
        phone: '03-1234-5678',
        email: 'tanaka@technology.co.jp',
        address: '東京都渋谷区渋谷1-1-1',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 2 },
      update: {},
      create: {
        customerName: '高橋美咲',
        companyName: '山田商事株式会社',
        industry: '卸売業',
        phone: '06-2345-6789',
        email: 'takahashi@yamada-trading.co.jp',
        address: '大阪府大阪市北区梅田2-2-2',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 3 },
      update: {},
      create: {
        customerName: '伊藤健太',
        companyName: '株式会社グローバル商社',
        industry: '商社',
        phone: '052-3456-7890',
        email: 'ito@global-trading.co.jp',
        address: '愛知県名古屋市中区栄3-3-3',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 4 },
      update: {},
      create: {
        customerName: '渡辺優子',
        companyName: '渡辺工業株式会社',
        industry: '製造業',
        phone: '045-4567-8901',
        email: 'watanabe@watanabe-industry.co.jp',
        address: '神奈川県横浜市西区みなとみらい4-4-4',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 5 },
      update: {},
      create: {
        customerName: '中村大輔',
        companyName: '株式会社フューチャーシステム',
        industry: 'IT',
        phone: '092-5678-9012',
        email: 'nakamura@future-system.co.jp',
        address: '福岡県福岡市博多区博多駅前5-5-5',
      },
    }),
    prisma.customer.upsert({
      where: { customerId: 6 },
      update: {},
      create: {
        customerName: '小林真由美',
        companyName: '小林リテール株式会社',
        industry: '小売業',
        phone: '011-6789-0123',
        email: 'kobayashi@kobayashi-retail.co.jp',
        address: '北海道札幌市中央区大通6-6-6',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // 日報データの作成
  console.log('📝 Creating daily reports...');

  // 下書き状態の日報
  const report1 = await prisma.dailyReport.create({
    data: {
      salesId: sales1.salesId,
      reportDate: new Date('2024-01-05'),
      problem: '新規顧客の開拓が思うように進んでいない。',
      plan: '明日は既存顧客へのフォローアップを中心に行う。',
      status: '下書き',
    },
  });

  // 提出済み状態の日報
  const report2 = await prisma.dailyReport.create({
    data: {
      salesId: sales1.salesId,
      reportDate: new Date('2024-01-04'),
      problem: '特になし',
      plan: '明日は新規顧客3社を訪問予定。',
      status: '提出済み',
      submittedAt: new Date('2024-01-04T18:00:00'),
    },
  });

  // 承認済み状態の日報
  const report3 = await prisma.dailyReport.create({
    data: {
      salesId: sales2.salesId,
      reportDate: new Date('2024-01-03'),
      problem: '特になし',
      plan: '明日は既存顧客との契約更新交渉を行う。',
      status: '承認済み',
      submittedAt: new Date('2024-01-03T18:00:00'),
      approvedAt: new Date('2024-01-03T19:30:00'),
      approvedBy: manager.salesId,
    },
  });

  // 差し戻し状態の日報
  const report4 = await prisma.dailyReport.create({
    data: {
      salesId: sales2.salesId,
      reportDate: new Date('2024-01-02'),
      problem: '訪問記録の詳細が不足しています。',
      plan: '明日は顧客訪問を予定。',
      status: '差し戻し',
      submittedAt: new Date('2024-01-02T18:00:00'),
    },
  });

  console.log(`✅ Created ${4} daily reports`);

  // 訪問記録データの作成
  console.log('📝 Creating visits...');

  await prisma.visit.createMany({
    data: [
      {
        reportId: report2.reportId,
        customerId: customers[0].customerId,
        visitContent:
          '新製品のプレゼンテーションを実施。好感触を得た。次回は具体的な提案を持参する予定。',
        visitTime: new Date('2024-01-04T10:00:00'),
      },
      {
        reportId: report2.reportId,
        customerId: customers[1].customerId,
        visitContent:
          '契約更新の打ち合わせ。価格面で調整が必要。来週再訪問予定。',
        visitTime: new Date('2024-01-04T14:00:00'),
      },
      {
        reportId: report3.reportId,
        customerId: customers[2].customerId,
        visitContent:
          '四半期の業績報告と次期の提案を実施。追加発注の可能性あり。',
        visitTime: new Date('2024-01-03T11:00:00'),
      },
      {
        reportId: report3.reportId,
        customerId: customers[3].customerId,
        visitContent: '新規案件のヒアリング。要件定義書を次回までに作成する。',
        visitTime: new Date('2024-01-03T15:30:00'),
      },
      {
        reportId: report4.reportId,
        customerId: customers[4].customerId,
        visitContent: '定例訪問。',
        visitTime: new Date('2024-01-02T10:00:00'),
      },
    ],
  });

  console.log(`✅ Created ${5} visits`);

  // コメントデータの作成
  console.log('📝 Creating comments...');

  await prisma.comment.createMany({
    data: [
      {
        reportId: report2.reportId,
        salesId: manager.salesId,
        commentContent:
          '訪問記録が詳細で良いです。次回の提案に期待しています。',
      },
      {
        reportId: report3.reportId,
        salesId: manager.salesId,
        commentContent:
          '素晴らしい成果です。引き続き顧客との関係強化をお願いします。',
      },
      {
        reportId: report4.reportId,
        salesId: manager.salesId,
        commentContent:
          '訪問内容の詳細を追記してください。どのような話をしたのか、顧客の反応はどうだったのかを記載してください。',
      },
      {
        reportId: report4.reportId,
        salesId: sales2.salesId,
        commentContent: '承知しました。訪問内容を詳細に記載して再提出します。',
      },
    ],
  });

  console.log(`✅ Created ${4} comments`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('  - Sales users: 3 (1 manager, 2 sales)');
  console.log('  - Customers: 6');
  console.log('  - Daily reports: 4 (下書き, 提出済み, 承認済み, 差し戻し)');
  console.log('  - Visits: 5');
  console.log('  - Comments: 4');
  console.log('');
  console.log('🔐 Test user credentials:');
  console.log('  Manager: manager@example.com / password123');
  console.log('  Sales 1: sales1@example.com / password123');
  console.log('  Sales 2: sales2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
