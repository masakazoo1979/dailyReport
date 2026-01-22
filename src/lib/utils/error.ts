/**
 * エラーハンドリング関数
 */

import { ZodError } from 'zod';

/**
 * アプリケーションエラーの基底クラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '認証が必要です') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
    this.name = 'AuthenticationError';
  }
}

/**
 * 認可エラー
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'この操作を行う権限がありません') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}

/**
 * リソース未検出エラー
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'リソース') {
    super(`${resource}が見つかりません`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  public errors: Record<string, string[]>;

  constructor(
    message: string = '入力内容に誤りがあります',
    errors: Record<string, string[]> = {}
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * 重複エラー
 */
export class DuplicateError extends AppError {
  constructor(message: string = '既に登録されています') {
    super(message, 409, 'DUPLICATE');
    this.name = 'DuplicateError';
  }
}

/**
 * Zodエラーをバリデーションエラーに変換
 */
export function fromZodError(zodError: ZodError): ValidationError {
  const errors: Record<string, string[]> = {};

  for (const issue of zodError.errors) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return new ValidationError('入力内容に誤りがあります', errors);
}

/**
 * エラーメッセージを取得
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return firstError?.message ?? '入力内容に誤りがあります';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '予期しないエラーが発生しました';
}

/**
 * エラーのHTTPステータスコードを取得
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  if (error instanceof ZodError) {
    return 400;
  }
  return 500;
}

/**
 * エラーコードを取得
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code;
  }
  if (error instanceof ZodError) {
    return 'VALIDATION_ERROR';
  }
  return 'INTERNAL_ERROR';
}

/**
 * エラーをログ用にフォーマット
 */
export function formatErrorForLog(error: unknown): Record<string, unknown> {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    };
  }
  if (error instanceof ZodError) {
    return {
      name: 'ZodError',
      message: 'Validation failed',
      errors: error.errors,
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    name: 'UnknownError',
    message: String(error),
  };
}

/**
 * エラーが再試行可能かどうかを判定
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    // 5xxエラーは再試行可能
    return error.statusCode >= 500;
  }
  return false;
}

/**
 * エラーをユーザー向けメッセージに変換
 */
export function toUserFriendlyMessage(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return 'ログインが必要です。ログインページに移動してください。';
  }
  if (error instanceof AuthorizationError) {
    return 'この操作を行う権限がありません。管理者にお問い合わせください。';
  }
  if (error instanceof NotFoundError) {
    return error.message;
  }
  if (error instanceof ValidationError) {
    return error.message;
  }
  if (error instanceof DuplicateError) {
    return error.message;
  }
  return 'エラーが発生しました。しばらくしてから再度お試しください。';
}
