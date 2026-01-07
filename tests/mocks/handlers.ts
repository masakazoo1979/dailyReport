import { http, HttpResponse } from 'msw';

export const handlers = [
  // 認証API
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        name: 'テストユーザー',
        email: 'test@example.com',
        role: 'SALES',
      },
    });
  }),

  // 日報API
  http.get('/api/daily-reports', () => {
    return HttpResponse.json({
      reports: [
        {
          id: '1',
          date: '2024-01-06',
          status: 'SUBMITTED',
          summary: 'テスト日報',
        },
      ],
    });
  }),
];
