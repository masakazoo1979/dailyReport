/**
 * 日付関連のユーティリティ関数
 */

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

/**
 * 日付を YYYY-MM-DD 形式にフォーマット（API用）
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 時刻を HH:MM 形式にフォーマット
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 日付を YYYY年M月D日 形式にフォーマット
 */
export function formatDateJapanese(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 日時を YYYY/MM/DD HH:MM 形式にフォーマット
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * 文字列をDateオブジェクトにパース
 * @param dateString YYYY-MM-DD 形式の文字列
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 2つの日付が同じ日かどうかを判定
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 指定された日付が今日かどうかを判定
 */
export function isToday(date: Date): boolean {
  return isSameDate(date, getTodayJST());
}

/**
 * 日付の相対表示（○日前、○時間前など）
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return formatDate(date);
  } else if (diffDays >= 1) {
    return `${diffDays}日前`;
  } else if (diffHours >= 1) {
    return `${diffHours}時間前`;
  } else if (diffMinutes >= 1) {
    return `${diffMinutes}分前`;
  } else {
    return 'たった今';
  }
}

/**
 * 曜日を取得
 */
export function getDayOfWeek(date: Date): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
}

/**
 * 日付に曜日を付加してフォーマット
 */
export function formatDateWithDayOfWeek(date: Date): string {
  return `${formatDate(date)}（${getDayOfWeek(date)}）`;
}
