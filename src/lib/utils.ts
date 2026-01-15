import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * JST (Asia/Tokyo) タイムゾーンオフセット（ミリ秒）
 */
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * JSTでの今日の日付を取得（時刻は00:00:00）
 */
export function getTodayJST(): Date {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const jstTime = new Date(utcTime + JST_OFFSET_MS);
  return new Date(jstTime.getFullYear(), jstTime.getMonth(), jstTime.getDate());
}

/**
 * JSTでの月初日を取得
 */
export function getFirstDayOfMonthJST(date: Date = new Date()): Date {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const jstTime = new Date(utcTime + JST_OFFSET_MS);
  return new Date(jstTime.getFullYear(), jstTime.getMonth(), 1);
}

/**
 * JSTでの月末日を取得
 */
export function getLastDayOfMonthJST(date: Date = new Date()): Date {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const jstTime = new Date(utcTime + JST_OFFSET_MS);
  return new Date(jstTime.getFullYear(), jstTime.getMonth() + 1, 0);
}

/**
 * 日付を YYYY/MM/DD 形式にフォーマット
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}
