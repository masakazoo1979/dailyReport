/**
 * テストデータ定義
 * API統合テストで使用するモックデータ
 */

// ユーザーデータ
export const mockSalesUser = {
  sales_id: 1,
  sales_name: '山田太郎',
  email: 'yamada@example.com',
  department: '営業1部',
  role: '一般',
  manager_id: 5,
  manager_name: '佐藤花子',
  password_hash: 'hashed_password',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockManagerUser = {
  sales_id: 5,
  sales_name: '佐藤花子',
  email: 'sato@example.com',
  department: '営業1部',
  role: '上長',
  manager_id: null,
  manager_name: null,
  password_hash: 'hashed_password',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockSalesList = [
  mockSalesUser,
  mockManagerUser,
  {
    sales_id: 2,
    sales_name: '鈴木次郎',
    email: 'suzuki@example.com',
    department: '営業2部',
    role: '一般',
    manager_id: 5,
    manager_name: '佐藤花子',
    password_hash: 'hashed_password',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// 顧客データ
export const mockCustomer1 = {
  customer_id: 10,
  customer_name: '鈴木一郎',
  company_name: 'ABC株式会社',
  department: '営業部',
  position: '部長',
  email: 'suzuki@abc.co.jp',
  phone: '03-1234-5678',
  address: '東京都千代田区',
  industry: 'IT',
  notes: '重要顧客',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockCustomer2 = {
  customer_id: 11,
  customer_name: '田中花子',
  company_name: 'XYZ商事',
  department: '購買部',
  position: '課長',
  email: 'tanaka@xyz.co.jp',
  phone: '03-9876-5432',
  address: '東京都港区',
  industry: '商社',
  notes: '',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockCustomerList = [mockCustomer1, mockCustomer2];

// 日報データ
export const mockDraftReport = {
  report_id: 1,
  sales_id: 1,
  sales_name: '山田太郎',
  department: '営業1部',
  report_date: '2024-01-06',
  problem: '新規顧客の開拓が課題です。',
  plan: '明日はB社へ訪問予定です。',
  status: '下書き',
  submitted_at: null,
  approved_at: null,
  approved_by: null,
  approved_by_name: null,
  visits: [],
  comments: [],
  created_at: '2024-01-06T09:00:00Z',
  updated_at: '2024-01-06T09:00:00Z',
};

export const mockSubmittedReport = {
  report_id: 2,
  sales_id: 1,
  sales_name: '山田太郎',
  department: '営業1部',
  report_date: '2024-01-05',
  problem: '新規顧客の開拓が課題です。',
  plan: '明日はB社へ訪問予定です。',
  status: '提出済み',
  submitted_at: '2024-01-05T18:30:00Z',
  approved_at: null,
  approved_by: null,
  approved_by_name: null,
  visits: [
    {
      visit_id: 1,
      report_id: 2,
      customer_id: 10,
      customer_name: '鈴木一郎',
      company_name: 'ABC株式会社',
      visit_time: '09:00:00',
      visit_content: '新規提案の説明を実施。好感触を得た。',
      created_at: '2024-01-05T09:00:00Z',
      updated_at: '2024-01-05T09:00:00Z',
    },
  ],
  comments: [
    {
      comment_id: 1,
      report_id: 2,
      sales_id: 5,
      sales_name: '佐藤花子',
      role: '上長',
      comment_content: '良い進捗ですね。引き続き頑張ってください。',
      created_at: '2024-01-05T19:00:00Z',
    },
  ],
  created_at: '2024-01-05T09:00:00Z',
  updated_at: '2024-01-05T18:30:00Z',
};

export const mockApprovedReport = {
  report_id: 3,
  sales_id: 1,
  sales_name: '山田太郎',
  department: '営業1部',
  report_date: '2024-01-04',
  problem: '既存顧客のフォローアップ。',
  plan: '新規提案の準備。',
  status: '承認済み',
  submitted_at: '2024-01-04T18:30:00Z',
  approved_at: '2024-01-05T09:00:00Z',
  approved_by: 5,
  approved_by_name: '佐藤花子',
  visits: [
    {
      visit_id: 2,
      report_id: 3,
      customer_id: 10,
      customer_name: '鈴木一郎',
      company_name: 'ABC株式会社',
      visit_time: '14:00:00',
      visit_content: '定期訪問。現状のヒアリング。',
      created_at: '2024-01-04T14:00:00Z',
      updated_at: '2024-01-04T14:00:00Z',
    },
  ],
  comments: [],
  created_at: '2024-01-04T09:00:00Z',
  updated_at: '2024-01-05T09:00:00Z',
};

export const mockRejectedReport = {
  report_id: 4,
  sales_id: 1,
  sales_name: '山田太郎',
  department: '営業1部',
  report_date: '2024-01-03',
  problem: '課題あり。',
  plan: '予定あり。',
  status: '差し戻し',
  submitted_at: '2024-01-03T18:30:00Z',
  approved_at: null,
  approved_by: null,
  approved_by_name: null,
  visits: [
    {
      visit_id: 3,
      report_id: 4,
      customer_id: 11,
      customer_name: '田中花子',
      company_name: 'XYZ商事',
      visit_time: '10:00:00',
      visit_content: '打ち合わせ。',
      created_at: '2024-01-03T10:00:00Z',
      updated_at: '2024-01-03T10:00:00Z',
    },
  ],
  comments: [
    {
      comment_id: 2,
      report_id: 4,
      sales_id: 5,
      sales_name: '佐藤花子',
      role: '上長',
      comment_content: '訪問内容をもう少し詳しく記載してください。',
      created_at: '2024-01-03T20:00:00Z',
    },
  ],
  created_at: '2024-01-03T09:00:00Z',
  updated_at: '2024-01-03T20:00:00Z',
};

export const mockReportList = [
  mockDraftReport,
  mockSubmittedReport,
  mockApprovedReport,
  mockRejectedReport,
];

// 訪問記録データ
export const mockVisit1 = {
  visit_id: 1,
  report_id: 2,
  customer_id: 10,
  customer_name: '鈴木一郎',
  company_name: 'ABC株式会社',
  visit_time: '09:00:00',
  visit_content: '新規提案の説明を実施。好感触を得た。',
  created_at: '2024-01-05T09:00:00Z',
  updated_at: '2024-01-05T09:00:00Z',
};

export const mockVisit2 = {
  visit_id: 2,
  report_id: 3,
  customer_id: 10,
  customer_name: '鈴木一郎',
  company_name: 'ABC株式会社',
  visit_time: '14:00:00',
  visit_content: '定期訪問。現状のヒアリング。',
  created_at: '2024-01-04T14:00:00Z',
  updated_at: '2024-01-04T14:00:00Z',
};

// コメントデータ
export const mockComment1 = {
  comment_id: 1,
  report_id: 2,
  sales_id: 5,
  sales_name: '佐藤花子',
  role: '上長',
  comment_content: '良い進捗ですね。引き続き頑張ってください。',
  created_at: '2024-01-05T19:00:00Z',
};

export const mockComment2 = {
  comment_id: 2,
  report_id: 4,
  sales_id: 5,
  sales_name: '佐藤花子',
  role: '上長',
  comment_content: '訪問内容をもう少し詳しく記載してください。',
  created_at: '2024-01-03T20:00:00Z',
};

// CSRFトークン
export const mockCsrfToken = 'test-csrf-token-abc123def456';

// ページネーション
export const mockPagination = {
  total: 4,
  page: 1,
  per_page: 20,
  total_pages: 1,
};
