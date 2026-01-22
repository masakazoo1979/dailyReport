/**
 * エラーログ記録ユーティリティ
 */

import { formatErrorForLog } from './error';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  context?: string;
  userId?: string;
  method?: string;
  url?: string;
  digest?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: Record<string, unknown>;
  context?: LogContext;
}

/**
 * ログエントリを作成
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  error?: unknown,
  context?: LogContext
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (error) {
    entry.error = formatErrorForLog(error);
  }

  if (context) {
    entry.context = context;
  }

  return entry;
}

/**
 * ログを出力
 */
function outputLog(entry: LogEntry): void {
  const logString = JSON.stringify(entry);

  switch (entry.level) {
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(logString);
      }
      break;
    case 'info':
      console.info(logString);
      break;
    case 'warn':
      console.warn(logString);
      break;
    case 'error':
      console.error(logString);
      break;
  }
}

/**
 * デバッグログを出力（開発環境のみ）
 */
export function logDebug(message: string, context?: LogContext): void {
  const entry = createLogEntry('debug', message, undefined, context);
  outputLog(entry);
}

/**
 * 情報ログを出力
 */
export function logInfo(message: string, context?: LogContext): void {
  const entry = createLogEntry('info', message, undefined, context);
  outputLog(entry);
}

/**
 * 警告ログを出力
 */
export function logWarn(message: string, context?: LogContext): void {
  const entry = createLogEntry('warn', message, undefined, context);
  outputLog(entry);
}

/**
 * エラーログを出力
 */
export function logError(error: unknown, context?: LogContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const entry = createLogEntry('error', message, error, context);
  outputLog(entry);
}

/**
 * APIリクエストのログを出力
 */
export function logApiRequest(
  method: string,
  url: string,
  statusCode: number,
  durationMs: number,
  userId?: string
): void {
  logInfo(`API ${method} ${url} ${statusCode} ${durationMs}ms`, {
    method,
    url,
    statusCode,
    durationMs,
    userId,
  } as LogContext);
}

/**
 * 認証関連のログを出力
 */
export function logAuth(
  action: 'login' | 'logout' | 'session_expired' | 'unauthorized',
  userId?: string,
  context?: LogContext
): void {
  logInfo(`Auth: ${action}`, {
    ...context,
    action,
    userId,
  });
}

/**
 * セキュリティ関連のログを出力
 */
export function logSecurity(
  event: string,
  details: Record<string, unknown>
): void {
  logWarn(`Security: ${event}`, details as LogContext);
}
