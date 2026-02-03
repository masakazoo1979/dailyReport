import { http, HttpResponse } from 'msw';
import {
  mockSalesUser,
  mockManagerUser,
  mockSalesList,
  mockCustomerList,
  mockReportList,
  mockVisit1,
  mockVisit2,
  mockCsrfToken,
  mockPagination,
} from './data/test-data';

// 認証状態を管理するための変数
let isAuthenticated = false;
let currentUser: typeof mockSalesUser | typeof mockManagerUser = mockSalesUser;

// 認証状態をリセットする関数（テスト間でクリーンな状態を保つため）
export function resetAuthState() {
  isAuthenticated = false;
  currentUser = mockSalesUser;
}

export const handlers = [
  // ===== 認証API =====

  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'yamada@example.com' && body.password === 'password') {
      isAuthenticated = true;
      currentUser = mockSalesUser;
      return HttpResponse.json({ data: mockSalesUser });
    } else if (
      body.email === 'sato@example.com' &&
      body.password === 'password'
    ) {
      isAuthenticated = true;
      currentUser = mockManagerUser;
      return HttpResponse.json({ data: mockManagerUser });
    } else {
      return HttpResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_FAILED',
            message: 'メールアドレスまたはパスワードが正しくありません',
          },
        },
        { status: 401 }
      );
    }
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', () => {
    isAuthenticated = false;
    return HttpResponse.json({ message: 'ログアウトしました' });
  }),

  // GET /api/auth/me
  http.get('/api/auth/me', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }
    return HttpResponse.json({ data: currentUser });
  }),

  // GET /api/auth/csrf-token
  http.get('/api/auth/csrf-token', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }
    return HttpResponse.json({ data: { csrf_token: mockCsrfToken } });
  }),

  // ===== 日報API =====

  // GET /api/reports
  http.get('/api/reports', ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let filteredReports = mockReportList;

    // ステータスフィルタリング
    if (status) {
      filteredReports = filteredReports.filter((r) => r.status === status);
    }

    // 一般営業は自分の日報のみ
    if (currentUser.role === '一般') {
      filteredReports = filteredReports.filter(
        (r) => r.sales_id === currentUser.sales_id
      );
    }

    return HttpResponse.json({
      data: filteredReports,
      pagination: mockPagination,
    });
  }),

  // GET /api/reports/:id
  http.get('/api/reports/:id', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    // 権限チェック: 一般営業は自分の日報のみ
    if (
      currentUser.role === '一般' &&
      report.sales_id !== currentUser.sales_id
    ) {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この日報にアクセスする権限がありません',
          },
        },
        { status: 403 }
      );
    }

    return HttpResponse.json({ data: report });
  }),

  // POST /api/reports
  http.post('/api/reports', async ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      report_date: string;
      problem?: string;
      plan?: string;
      status: string;
    };

    // バリデーション: 同日の日報チェック
    const existingReport = mockReportList.find(
      (r) => r.report_date === body.report_date
    );
    if (existingReport) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力内容に誤りがあります',
            details: [
              {
                field: 'report_date',
                message: '同じ日付の日報が既に存在します',
              },
            ],
          },
        },
        { status: 422 }
      );
    }

    const newReport = {
      report_id: 100,
      sales_id: currentUser.sales_id,
      sales_name: currentUser.sales_name,
      department: currentUser.department,
      report_date: body.report_date,
      problem: body.problem || '',
      plan: body.plan || '',
      status: body.status,
      submitted_at: null,
      approved_at: null,
      approved_by: null,
      approved_by_name: null,
      visits: [],
      comments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newReport }, { status: 201 });
  }),

  // PUT /api/reports/:id
  http.put('/api/reports/:id', async ({ params, request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    // 権限チェック
    if (report.sales_id !== currentUser.sales_id) {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この日報にアクセスする権限がありません',
          },
        },
        { status: 403 }
      );
    }

    // ステータスチェック: 提出済み・承認済み・差し戻し以外は編集不可
    if (report.status === '提出済み' || report.status === '承認済み') {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_EDITABLE',
            message: 'この日報は編集できません',
          },
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      problem?: string;
      plan?: string;
    };

    const updatedReport = {
      ...report,
      problem: body.problem ?? report.problem,
      plan: body.plan ?? report.plan,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: updatedReport });
  }),

  // DELETE /api/reports/:id
  http.delete('/api/reports/:id', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    // 権限チェック
    if (report.sales_id !== currentUser.sales_id) {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この日報にアクセスする権限がありません',
          },
        },
        { status: 403 }
      );
    }

    // ステータスチェック: 下書きのみ削除可能
    if (report.status !== '下書き') {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_DELETABLE',
            message: 'この日報は削除できません',
          },
        },
        { status: 403 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/reports/:id/submit
  http.post('/api/reports/:id/submit', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    // 訪問記録のチェック
    if (report.visits.length === 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '日報を提出するには、訪問記録を1件以上登録してください',
          },
        },
        { status: 422 }
      );
    }

    return HttpResponse.json({
      data: {
        report_id: reportId,
        status: '提出済み',
        submitted_at: new Date().toISOString(),
      },
    });
  }),

  // POST /api/reports/:id/approve
  http.post('/api/reports/:id/approve', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    // 上長権限チェック
    if (currentUser.role !== '上長') {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この操作を実行する権限がありません',
          },
        },
        { status: 403 }
      );
    }

    const reportId = Number(params.id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: {
        report_id: reportId,
        status: '承認済み',
        approved_at: new Date().toISOString(),
        approved_by: currentUser.sales_id,
        approved_by_name: currentUser.sales_name,
      },
    });
  }),

  // POST /api/reports/:id/reject
  http.post('/api/reports/:id/reject', async ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    // 上長権限チェック
    if (currentUser.role !== '上長') {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この操作を実行する権限がありません',
          },
        },
        { status: 403 }
      );
    }

    const reportId = Number(params.id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: {
        report_id: reportId,
        status: '差し戻し',
      },
    });
  }),

  // ===== 訪問記録API =====

  // GET /api/reports/:report_id/visits
  http.get('/api/reports/:report_id/visits', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.report_id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: report.visits });
  }),

  // POST /api/reports/:report_id/visits
  http.post('/api/reports/:report_id/visits', async ({ params, request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.report_id);
    const body = (await request.json()) as {
      customer_id: number;
      visit_time: string;
      visit_content: string;
    };

    const customer = mockCustomerList.find(
      (c) => c.customer_id === body.customer_id
    );

    if (!customer) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力内容に誤りがあります',
            details: [
              {
                field: 'customer_id',
                message: '顧客が見つかりません',
              },
            ],
          },
        },
        { status: 422 }
      );
    }

    const newVisit = {
      visit_id: 100,
      report_id: reportId,
      customer_id: body.customer_id,
      customer_name: customer.customer_name,
      company_name: customer.company_name,
      visit_time: body.visit_time,
      visit_content: body.visit_content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newVisit }, { status: 201 });
  }),

  // PUT /api/visits/:id
  http.put('/api/visits/:id', async ({ params, request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const visitId = Number(params.id);
    const visit = visitId === 1 ? mockVisit1 : mockVisit2;

    const body = (await request.json()) as {
      customer_id?: number;
      visit_time?: string;
      visit_content?: string;
    };

    const updatedVisit = {
      ...visit,
      visit_time: body.visit_time ?? visit.visit_time,
      visit_content: body.visit_content ?? visit.visit_content,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: updatedVisit });
  }),

  // DELETE /api/visits/:id
  http.delete('/api/visits/:id', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // ===== コメントAPI =====

  // GET /api/reports/:report_id/comments
  http.get('/api/reports/:report_id/comments', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.report_id);
    const report = mockReportList.find((r) => r.report_id === reportId);

    if (!report) {
      return HttpResponse.json(
        {
          error: {
            code: 'REPORT_NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: report.comments });
  }),

  // POST /api/reports/:report_id/comments
  http.post('/api/reports/:report_id/comments', async ({ params, request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const reportId = Number(params.report_id);
    const body = (await request.json()) as {
      comment_content: string;
    };

    const newComment = {
      comment_id: 100,
      report_id: reportId,
      sales_id: currentUser.sales_id,
      sales_name: currentUser.sales_name,
      role: currentUser.role,
      comment_content: body.comment_content,
      created_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newComment }, { status: 201 });
  }),

  // DELETE /api/comments/:id
  http.delete('/api/comments/:id', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // ===== 顧客API =====

  // GET /api/customers
  http.get('/api/customers', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      data: mockCustomerList,
      pagination: mockPagination,
    });
  }),

  // GET /api/customers/:id
  http.get('/api/customers/:id', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const customerId = Number(params.id);
    const customer = mockCustomerList.find((c) => c.customer_id === customerId);

    if (!customer) {
      return HttpResponse.json(
        {
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: '顧客が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: customer });
  }),

  // POST /api/customers
  http.post('/api/customers', async ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      customer_name: string;
      company_name: string;
      department?: string;
      position?: string;
      email?: string;
      phone?: string;
      address?: string;
      industry?: string;
      notes?: string;
    };

    const newCustomer = {
      customer_id: 100,
      customer_name: body.customer_name,
      company_name: body.company_name,
      department: body.department || '',
      position: body.position || '',
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      industry: body.industry || '',
      notes: body.notes || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newCustomer }, { status: 201 });
  }),

  // PUT /api/customers/:id
  http.put('/api/customers/:id', async ({ params, request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const customerId = Number(params.id);
    const customer = mockCustomerList.find((c) => c.customer_id === customerId);

    if (!customer) {
      return HttpResponse.json(
        {
          error: {
            code: 'CUSTOMER_NOT_FOUND',
            message: '顧客が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<typeof customer>;

    const updatedCustomer = {
      ...customer,
      ...body,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: updatedCustomer });
  }),

  // DELETE /api/customers/:id
  http.delete('/api/customers/:id', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // ===== 営業担当者API =====

  // GET /api/sales
  http.get('/api/sales', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    // 上長のみアクセス可能
    if (currentUser.role !== '上長') {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この操作を実行する権限がありません',
          },
        },
        { status: 403 }
      );
    }

    return HttpResponse.json({
      data: mockSalesList,
      pagination: mockPagination,
    });
  }),

  // GET /api/sales/:id
  http.get('/api/sales/:id', ({ params }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    const salesId = Number(params.id);
    const sales = mockSalesList.find((s) => s.sales_id === salesId);

    if (!sales) {
      return HttpResponse.json(
        {
          error: {
            code: 'SALES_NOT_FOUND',
            message: '営業担当者が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: sales });
  }),

  // POST /api/sales
  http.post('/api/sales', async ({ request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    // 上長のみアクセス可能
    if (currentUser.role !== '上長') {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この操作を実行する権限がありません',
          },
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as {
      sales_name: string;
      email: string;
      department: string;
      role: string;
      manager_id?: number;
    };

    const newSales = {
      sales_id: 100,
      sales_name: body.sales_name,
      email: body.email,
      department: body.department,
      role: body.role,
      manager_id: body.manager_id || null,
      manager_name: null,
      password_hash: 'hashed_password',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: newSales }, { status: 201 });
  }),

  // PUT /api/sales/:id
  http.put('/api/sales/:id', async ({ params, request }) => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    // 上長のみアクセス可能
    if (currentUser.role !== '上長') {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この操作を実行する権限がありません',
          },
        },
        { status: 403 }
      );
    }

    const salesId = Number(params.id);
    const sales = mockSalesList.find((s) => s.sales_id === salesId);

    if (!sales) {
      return HttpResponse.json(
        {
          error: {
            code: 'SALES_NOT_FOUND',
            message: '営業担当者が見つかりません',
          },
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<typeof sales>;

    const updatedSales = {
      ...sales,
      ...body,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json({ data: updatedSales });
  }),

  // DELETE /api/sales/:id
  http.delete('/api/sales/:id', () => {
    if (!isAuthenticated) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    }

    // 上長のみアクセス可能
    if (currentUser.role !== '上長') {
      return HttpResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'この操作を実行する権限がありません',
          },
        },
        { status: 403 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
