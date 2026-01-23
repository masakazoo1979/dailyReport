/**
 * トースト通知ヘルパー関数
 */

import { toast } from 'sonner';
import { getErrorMessage, toUserFriendlyMessage } from './error';
import type { ApiErrorResponse } from './api';

/**
 * 成功トーストを表示
 */
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
  });
}

/**
 * エラートーストを表示
 */
export function showErrorToast(
  error: unknown,
  fallbackMessage = 'エラーが発生しました'
) {
  const message = error ? toUserFriendlyMessage(error) : fallbackMessage;
  toast.error(message);
}

/**
 * APIエラーレスポンスからトーストを表示
 */
export function showApiErrorToast(response: ApiErrorResponse) {
  const message = response.error.message || 'エラーが発生しました';
  toast.error(message);
}

/**
 * 警告トーストを表示
 */
export function showWarningToast(message: string, description?: string) {
  toast.warning(message, {
    description,
  });
}

/**
 * 情報トーストを表示
 */
export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
  });
}

/**
 * ローディングトーストを表示
 * 返された promise を使って状態を更新可能
 */
export function showLoadingToast<T>(
  promise: Promise<T>,
  options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) {
  return toast.promise(promise, {
    loading: options.loading,
    success: options.success,
    error: (err) =>
      typeof options.error === 'function'
        ? options.error(err)
        : getErrorMessage(err) || options.error,
  });
}

/**
 * fetchエラーハンドリング付きのラッパー
 */
export async function fetchWithToast<T>(
  url: string,
  options?: RequestInit,
  successMessage?: string
): Promise<T | null> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = (await response.json()) as ApiErrorResponse;
      showApiErrorToast(errorData);
      return null;
    }

    const data = await response.json();

    if (successMessage) {
      showSuccessToast(successMessage);
    }

    return data as T;
  } catch (error) {
    showErrorToast(error, 'ネットワークエラーが発生しました');
    return null;
  }
}
