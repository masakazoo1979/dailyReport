import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, beforeEach } from 'vitest';
import { server } from './mocks/server';
import { resetAuthState } from './mocks/handlers';

// MSWサーバーの起動・停止
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());
beforeEach(() => {
  // 各テストの前に認証状態をリセット
  resetAuthState();
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
