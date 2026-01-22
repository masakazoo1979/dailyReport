/**
 * API応答ヘルパー関数
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  AppError,
  getErrorMessage,
  getErrorStatusCode,
  getErrorCode,
  fromZodError,
  formatErrorForLog,
} from './error';

/**
 * 成功レスポンスの型
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * エラーレスポンスの型
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * ページネーション情報
 */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/**
 * リストレスポンスの型
 */
export interface ApiListResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * 成功レスポンスを作成
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      message,
    },
    { status }
  );
}

/**
 * リストレスポンスを作成
 */
export function createListResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status: number = 200
): NextResponse<ApiListResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      pagination,
    },
    { status }
  );
}

/**
 * 作成成功レスポンスを作成
 */
export function createCreatedResponse<T>(
  data: T,
  message: string = '作成しました'
): NextResponse<ApiSuccessResponse<T>> {
  return createSuccessResponse(data, message, 201);
}

/**
 * 削除成功レスポンスを作成
 */
export function createDeletedResponse(
  message: string = '削除しました'
): NextResponse<ApiSuccessResponse<null>> {
  return createSuccessResponse(null, message, 200);
}

/**
 * エラーレスポンスを作成
 */
export function createErrorResponse(
  error: unknown
): NextResponse<ApiErrorResponse> {
  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  // 開発環境ではエラーをログに出力
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', formatErrorForLog(error));
  }

  // ValidationErrorの場合は詳細情報を含める
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code,
          message,
          details: validationError.errors,
        },
      },
      { status: statusCode }
    );
  }

  if (error instanceof AppError && 'errors' in error) {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code,
          message,
          details: (error as AppError & { errors: Record<string, string[]> })
            .errors,
        },
      },
      { status: statusCode }
    );
  }

  return NextResponse.json(
    {
      success: false as const,
      error: {
        code,
        message,
      },
    },
    { status: statusCode }
  );
}

/**
 * 認証エラーレスポンスを作成
 */
export function createUnauthorizedResponse(
  message: string = '認証が必要です'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message,
      },
    },
    { status: 401 }
  );
}

/**
 * 認可エラーレスポンスを作成
 */
export function createForbiddenResponse(
  message: string = 'この操作を行う権限がありません'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code: 'FORBIDDEN',
        message,
      },
    },
    { status: 403 }
  );
}

/**
 * Not Foundレスポンスを作成
 */
export function createNotFoundResponse(
  resource: string = 'リソース'
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code: 'NOT_FOUND',
        message: `${resource}が見つかりません`,
      },
    },
    { status: 404 }
  );
}

/**
 * バリデーションエラーレスポンスを作成
 */
export function createValidationErrorResponse(
  message: string = '入力内容に誤りがあります',
  details?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details,
      },
    },
    { status: 400 }
  );
}

/**
 * ページネーション情報を計算
 */
export function calculatePagination(
  total: number,
  page: number,
  perPage: number
): PaginationMeta {
  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * リクエストボディをパースしてバリデーション
 */
export async function parseRequestBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * URLパラメータからIDを取得
 */
export function getIdFromParams(params: { id?: string }): number {
  const id = params.id;
  if (!id) {
    throw new AppError('IDが指定されていません', 400, 'MISSING_ID');
  }
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
    throw new AppError('無効なIDです', 400, 'INVALID_ID');
  }
  return numericId;
}

/**
 * クエリパラメータを取得
 */
export function getQueryParams(
  request: Request
): Record<string, string | undefined> {
  const url = new URL(request.url);
  const params: Record<string, string | undefined> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * ページネーションパラメータを取得
 */
export function getPaginationParams(request: Request): {
  page: number;
  perPage: number;
  skip: number;
} {
  const params = getQueryParams(request);
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(params.perPage ?? '20', 10) || 20)
  );
  const skip = (page - 1) * perPage;
  return { page, perPage, skip };
}

/**
 * APIルートハンドラーをラップしてエラーハンドリングを統一
 */
export function withErrorHandler<T>(
  handler: (
    request: Request,
    context: { params: Promise<Record<string, string>> }
  ) => Promise<NextResponse<T>>
) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse<T | ApiErrorResponse>> => {
    try {
      return await handler(request, context);
    } catch (error) {
      // エラーログを記録
      const { logError } = await import('./logger');
      logError(error, {
        context: 'APIHandler',
        method: request.method,
        url: request.url,
      });

      return createErrorResponse(error) as NextResponse<ApiErrorResponse>;
    }
  };
}
