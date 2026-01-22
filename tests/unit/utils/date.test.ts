import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getTodayJST,
  getFirstDayOfMonthJST,
  getLastDayOfMonthJST,
  formatDate,
  formatDateForApi,
  formatTime,
  formatDateJapanese,
  formatDateTime,
  parseDate,
  isSameDate,
  formatRelativeTime,
  getDayOfWeek,
  formatDateWithDayOfWeek,
} from '@/lib/utils/date';

describe('日付ユーティリティ関数', () => {
  describe('formatDate', () => {
    it('日付をYYYY/MM/DD形式にフォーマットできる', () => {
      const date = new Date(2024, 0, 15); // 2024-01-15
      expect(formatDate(date)).toBe('2024/01/15');
    });

    it('月と日が1桁の場合、ゼロ埋めされる', () => {
      const date = new Date(2024, 0, 5); // 2024-01-05
      expect(formatDate(date)).toBe('2024/01/05');
    });
  });

  describe('formatDateForApi', () => {
    it('日付をYYYY-MM-DD形式にフォーマットできる', () => {
      const date = new Date(2024, 0, 15);
      expect(formatDateForApi(date)).toBe('2024-01-15');
    });
  });

  describe('formatTime', () => {
    it('時刻をHH:MM形式にフォーマットできる', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      expect(formatTime(date)).toBe('14:30');
    });

    it('時と分が1桁の場合、ゼロ埋めされる', () => {
      const date = new Date(2024, 0, 15, 9, 5);
      expect(formatTime(date)).toBe('09:05');
    });
  });

  describe('formatDateJapanese', () => {
    it('日付をYYYY年M月D日形式にフォーマットできる', () => {
      const date = new Date(2024, 0, 15);
      expect(formatDateJapanese(date)).toBe('2024年1月15日');
    });
  });

  describe('formatDateTime', () => {
    it('日時をYYYY/MM/DD HH:MM形式にフォーマットできる', () => {
      const date = new Date(2024, 0, 15, 14, 30);
      expect(formatDateTime(date)).toBe('2024/01/15 14:30');
    });
  });

  describe('parseDate', () => {
    it('YYYY-MM-DD形式の文字列をDateオブジェクトにパースできる', () => {
      const result = parseDate('2024-01-15');
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // 0-indexed
      expect(result.getDate()).toBe(15);
    });
  });

  describe('isSameDate', () => {
    it('同じ日付の場合trueを返す', () => {
      const date1 = new Date(2024, 0, 15, 10, 0);
      const date2 = new Date(2024, 0, 15, 14, 30);
      expect(isSameDate(date1, date2)).toBe(true);
    });

    it('異なる日付の場合falseを返す', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 16);
      expect(isSameDate(date1, date2)).toBe(false);
    });
  });

  describe('getDayOfWeek', () => {
    it('日曜日の場合「日」を返す', () => {
      const date = new Date(2024, 0, 14); // Sunday
      expect(getDayOfWeek(date)).toBe('日');
    });

    it('月曜日の場合「月」を返す', () => {
      const date = new Date(2024, 0, 15); // Monday
      expect(getDayOfWeek(date)).toBe('月');
    });
  });

  describe('formatDateWithDayOfWeek', () => {
    it('日付に曜日を付加してフォーマットできる', () => {
      const date = new Date(2024, 0, 15); // Monday
      expect(formatDateWithDayOfWeek(date)).toBe('2024/01/15（月）');
    });
  });

  describe('getTodayJST', () => {
    it('Dateオブジェクトを返す', () => {
      const today = getTodayJST();
      expect(today).toBeInstanceOf(Date);
    });

    it('時刻が00:00:00になっている', () => {
      const today = getTodayJST();
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
    });
  });

  describe('getFirstDayOfMonthJST', () => {
    it('月初日を返す', () => {
      const date = new Date(2024, 5, 15); // June 15, 2024
      const firstDay = getFirstDayOfMonthJST(date);
      expect(firstDay.getDate()).toBe(1);
    });
  });

  describe('getLastDayOfMonthJST', () => {
    it('月末日を返す', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const lastDay = getLastDayOfMonthJST(date);
      expect(lastDay.getDate()).toBe(31);
    });

    it('2月の月末日を正しく返す（閏年）', () => {
      const date = new Date(2024, 1, 15); // February 15, 2024 (leap year)
      const lastDay = getLastDayOfMonthJST(date);
      expect(lastDay.getDate()).toBe(29);
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('1分未満の場合「たった今」を返す', () => {
      const now = new Date(2024, 0, 15, 12, 0, 0);
      vi.setSystemTime(now);
      const date = new Date(2024, 0, 15, 11, 59, 50);
      expect(formatRelativeTime(date)).toBe('たった今');
    });

    it('1時間未満の場合「○分前」を返す', () => {
      const now = new Date(2024, 0, 15, 12, 0, 0);
      vi.setSystemTime(now);
      const date = new Date(2024, 0, 15, 11, 30, 0);
      expect(formatRelativeTime(date)).toBe('30分前');
    });

    it('1日未満の場合「○時間前」を返す', () => {
      const now = new Date(2024, 0, 15, 12, 0, 0);
      vi.setSystemTime(now);
      const date = new Date(2024, 0, 15, 9, 0, 0);
      expect(formatRelativeTime(date)).toBe('3時間前');
    });

    it('7日以内の場合「○日前」を返す', () => {
      const now = new Date(2024, 0, 15, 12, 0, 0);
      vi.setSystemTime(now);
      const date = new Date(2024, 0, 12, 12, 0, 0);
      expect(formatRelativeTime(date)).toBe('3日前');
    });

    it('7日より前の場合、日付をフォーマットして返す', () => {
      const now = new Date(2024, 0, 15, 12, 0, 0);
      vi.setSystemTime(now);
      const date = new Date(2024, 0, 1, 12, 0, 0);
      expect(formatRelativeTime(date)).toBe('2024/01/01');
    });
  });
});
