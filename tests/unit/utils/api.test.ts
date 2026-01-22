import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSuccessResponse,
  createListResponse,
  createCreatedResponse,
  createDeletedResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createNotFoundResponse,
  createValidationErrorResponse,
  calculatePagination,
  getIdFromParams,
  getQueryParams,
  getPaginationParams,
} from '@/lib/utils/api';
import { AppError } from '@/lib/utils/error';

// NextResponse.jsonをモック
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, options) => ({
      body,
      status: options?.status ?? 200,
    })),
  },
}));

describe('API応答ヘルパー関数', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSuccessResponse', () => {
    it('成功レスポンスを作成できる', () => {
      const data = { id: 1, name: 'Test' };
      createSuccessResponse(data);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message: undefined,
        },
        { status: 200 }
      );
    });

    it('メッセージ付きの成功レスポンスを作成できる', () => {
      const data = { id: 1 };
      createSuccessResponse(data, '更新しました');

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message: '更新しました',
        },
        { status: 200 }
      );
    });

    it('カスタムステータスコードを指定できる', () => {
      createSuccessResponse({}, undefined, 201);

      expect(NextResponse.json).toHaveBeenCalledWith(expect.anything(), {
        status: 201,
      });
    });
  });

  describe('createListResponse', () => {
    it('リストレスポンスを作成できる', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, perPage: 20, total: 100, totalPages: 5 };
      createListResponse(data, pagination);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          pagination,
        },
        { status: 200 }
      );
    });
  });

  describe('createCreatedResponse', () => {
    it('201ステータスのレスポンスを作成できる', () => {
      const data = { id: 1 };
      createCreatedResponse(data);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message: '作成しました',
        },
        { status: 201 }
      );
    });
  });

  describe('createDeletedResponse', () => {
    it('削除成功レスポンスを作成できる', () => {
      createDeletedResponse();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: null,
          message: '削除しました',
        },
        { status: 200 }
      );
    });
  });

  describe('createErrorResponse', () => {
    it('AppErrorからエラーレスポンスを作成できる', () => {
      const error = new AppError('テストエラー', 400, 'TEST_ERROR');
      createErrorResponse(error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'TEST_ERROR',
            message: 'テストエラー',
          },
        },
        { status: 400 }
      );
    });

    it('ZodErrorからエラーレスポンスを作成できる', () => {
      const schema = z.object({
        email: z.string().email('無効なメールアドレス'),
      });

      try {
        schema.parse({ email: 'invalid' });
      } catch (e) {
        createErrorResponse(e);

        expect(NextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'VALIDATION_ERROR',
              details: expect.any(Object),
            }),
          }),
          { status: 400 }
        );
      }
    });
  });

  describe('createUnauthorizedResponse', () => {
    it('401レスポンスを作成できる', () => {
      createUnauthorizedResponse();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '認証が必要です',
          },
        },
        { status: 401 }
      );
    });
  });

  describe('createForbiddenResponse', () => {
    it('403レスポンスを作成できる', () => {
      createForbiddenResponse();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'この操作を行う権限がありません',
          },
        },
        { status: 403 }
      );
    });
  });

  describe('createNotFoundResponse', () => {
    it('404レスポンスを作成できる', () => {
      createNotFoundResponse('日報');

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '日報が見つかりません',
          },
        },
        { status: 404 }
      );
    });
  });

  describe('createValidationErrorResponse', () => {
    it('バリデーションエラーレスポンスを作成できる', () => {
      const details = { email: ['メールアドレスを入力してください'] };
      createValidationErrorResponse('入力エラー', details);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '入力エラー',
            details,
          },
        },
        { status: 400 }
      );
    });
  });

  describe('calculatePagination', () => {
    it('ページネーション情報を計算できる', () => {
      const result = calculatePagination(100, 2, 20);
      expect(result).toEqual({
        page: 2,
        perPage: 20,
        total: 100,
        totalPages: 5,
      });
    });

    it('端数がある場合、切り上げで総ページ数を計算する', () => {
      const result = calculatePagination(101, 1, 20);
      expect(result.totalPages).toBe(6);
    });
  });

  describe('getIdFromParams', () => {
    it('文字列IDを数値に変換できる', () => {
      expect(getIdFromParams({ id: '123' })).toBe(123);
    });

    it('IDがない場合エラーをスローする', () => {
      expect(() => getIdFromParams({})).toThrow('IDが指定されていません');
    });

    it('無効なIDの場合エラーをスローする', () => {
      expect(() => getIdFromParams({ id: 'abc' })).toThrow('無効なIDです');
      expect(() => getIdFromParams({ id: '0' })).toThrow('無効なIDです');
      expect(() => getIdFromParams({ id: '-1' })).toThrow('無効なIDです');
    });
  });

  describe('getQueryParams', () => {
    it('URLからクエリパラメータを取得できる', () => {
      const request = new Request('http://localhost/api?page=2&status=draft');
      const params = getQueryParams(request);
      expect(params.page).toBe('2');
      expect(params.status).toBe('draft');
    });
  });

  describe('getPaginationParams', () => {
    it('デフォルト値を返す', () => {
      const request = new Request('http://localhost/api');
      const { page, perPage, skip } = getPaginationParams(request);
      expect(page).toBe(1);
      expect(perPage).toBe(20);
      expect(skip).toBe(0);
    });

    it('指定された値を返す', () => {
      const request = new Request('http://localhost/api?page=3&perPage=10');
      const { page, perPage, skip } = getPaginationParams(request);
      expect(page).toBe(3);
      expect(perPage).toBe(10);
      expect(skip).toBe(20);
    });

    it('perPageは最大100に制限される', () => {
      const request = new Request('http://localhost/api?perPage=200');
      const { perPage } = getPaginationParams(request);
      expect(perPage).toBe(100);
    });

    it('pageは最小1に制限される', () => {
      const request = new Request('http://localhost/api?page=0');
      const { page } = getPaginationParams(request);
      expect(page).toBe(1);
    });
  });
});
