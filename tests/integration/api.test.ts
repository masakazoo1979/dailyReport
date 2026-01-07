import { describe, it, expect } from 'vitest';

describe('API Integration Test (with MSW)', () => {
  it('should mock login API', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'test' }),
    });

    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
  });

  it('should mock daily reports API', async () => {
    const response = await fetch('/api/daily-reports');
    const data = await response.json();

    expect(data.reports).toBeDefined();
    expect(data.reports).toHaveLength(1);
    expect(data.reports[0].status).toBe('SUBMITTED');
  });
});
