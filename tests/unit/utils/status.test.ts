import { describe, it, expect } from 'vitest';
import {
  getStatusColor,
  getStatusBadgeClass,
  getStatusIcon,
  isStatusEditable,
  isStatusSubmittable,
  isStatusApprovable,
  getStatusDescription,
  getNextAvailableStatuses,
  isValidStatus,
  toReportStatus,
} from '@/lib/utils/status';
import { REPORT_STATUSES } from '@/lib/constants';

describe('ステータスヘルパー関数', () => {
  describe('getStatusColor', () => {
    it('下書きの場合secondaryを返す', () => {
      expect(getStatusColor(REPORT_STATUSES.DRAFT)).toBe('secondary');
    });

    it('提出済みの場合defaultを返す', () => {
      expect(getStatusColor(REPORT_STATUSES.SUBMITTED)).toBe('default');
    });

    it('承認済みの場合successを返す', () => {
      expect(getStatusColor(REPORT_STATUSES.APPROVED)).toBe('success');
    });

    it('差し戻しの場合destructiveを返す', () => {
      expect(getStatusColor(REPORT_STATUSES.REJECTED)).toBe('destructive');
    });
  });

  describe('getStatusBadgeClass', () => {
    it('下書きの場合グレーのクラスを返す', () => {
      const result = getStatusBadgeClass(REPORT_STATUSES.DRAFT);
      expect(result).toContain('bg-gray-100');
    });

    it('提出済みの場合青のクラスを返す', () => {
      const result = getStatusBadgeClass(REPORT_STATUSES.SUBMITTED);
      expect(result).toContain('bg-blue-100');
    });

    it('承認済みの場合緑のクラスを返す', () => {
      const result = getStatusBadgeClass(REPORT_STATUSES.APPROVED);
      expect(result).toContain('bg-green-100');
    });

    it('差し戻しの場合赤のクラスを返す', () => {
      const result = getStatusBadgeClass(REPORT_STATUSES.REJECTED);
      expect(result).toContain('bg-red-100');
    });
  });

  describe('getStatusIcon', () => {
    it('下書きの場合file-editを返す', () => {
      expect(getStatusIcon(REPORT_STATUSES.DRAFT)).toBe('file-edit');
    });

    it('提出済みの場合sendを返す', () => {
      expect(getStatusIcon(REPORT_STATUSES.SUBMITTED)).toBe('send');
    });

    it('承認済みの場合check-circleを返す', () => {
      expect(getStatusIcon(REPORT_STATUSES.APPROVED)).toBe('check-circle');
    });

    it('差し戻しの場合x-circleを返す', () => {
      expect(getStatusIcon(REPORT_STATUSES.REJECTED)).toBe('x-circle');
    });
  });

  describe('isStatusEditable', () => {
    it('下書きの場合trueを返す', () => {
      expect(isStatusEditable(REPORT_STATUSES.DRAFT)).toBe(true);
    });

    it('差し戻しの場合trueを返す', () => {
      expect(isStatusEditable(REPORT_STATUSES.REJECTED)).toBe(true);
    });

    it('提出済みの場合falseを返す', () => {
      expect(isStatusEditable(REPORT_STATUSES.SUBMITTED)).toBe(false);
    });

    it('承認済みの場合falseを返す', () => {
      expect(isStatusEditable(REPORT_STATUSES.APPROVED)).toBe(false);
    });
  });

  describe('isStatusSubmittable', () => {
    it('下書きの場合trueを返す', () => {
      expect(isStatusSubmittable(REPORT_STATUSES.DRAFT)).toBe(true);
    });

    it('差し戻しの場合trueを返す', () => {
      expect(isStatusSubmittable(REPORT_STATUSES.REJECTED)).toBe(true);
    });

    it('提出済みの場合falseを返す', () => {
      expect(isStatusSubmittable(REPORT_STATUSES.SUBMITTED)).toBe(false);
    });

    it('承認済みの場合falseを返す', () => {
      expect(isStatusSubmittable(REPORT_STATUSES.APPROVED)).toBe(false);
    });
  });

  describe('isStatusApprovable', () => {
    it('提出済みの場合trueを返す', () => {
      expect(isStatusApprovable(REPORT_STATUSES.SUBMITTED)).toBe(true);
    });

    it('下書きの場合falseを返す', () => {
      expect(isStatusApprovable(REPORT_STATUSES.DRAFT)).toBe(false);
    });

    it('承認済みの場合falseを返す', () => {
      expect(isStatusApprovable(REPORT_STATUSES.APPROVED)).toBe(false);
    });

    it('差し戻しの場合falseを返す', () => {
      expect(isStatusApprovable(REPORT_STATUSES.REJECTED)).toBe(false);
    });
  });

  describe('getStatusDescription', () => {
    it('下書きの場合、説明文を返す', () => {
      const description = getStatusDescription(REPORT_STATUSES.DRAFT);
      expect(description).toContain('下書き');
    });

    it('提出済みの場合、説明文を返す', () => {
      const description = getStatusDescription(REPORT_STATUSES.SUBMITTED);
      expect(description).toContain('承認待ち');
    });

    it('承認済みの場合、説明文を返す', () => {
      const description = getStatusDescription(REPORT_STATUSES.APPROVED);
      expect(description).toContain('承認済み');
    });

    it('差し戻しの場合、説明文を返す', () => {
      const description = getStatusDescription(REPORT_STATUSES.REJECTED);
      expect(description).toContain('差し戻されました');
    });
  });

  describe('getNextAvailableStatuses', () => {
    it('下書きの場合、提出済みのみを返す', () => {
      const statuses = getNextAvailableStatuses(REPORT_STATUSES.DRAFT, false);
      expect(statuses).toEqual([REPORT_STATUSES.SUBMITTED]);
    });

    it('提出済みで上長の場合、承認済みと差し戻しを返す', () => {
      const statuses = getNextAvailableStatuses(
        REPORT_STATUSES.SUBMITTED,
        true
      );
      expect(statuses).toContain(REPORT_STATUSES.APPROVED);
      expect(statuses).toContain(REPORT_STATUSES.REJECTED);
    });

    it('提出済みで一般営業の場合、空配列を返す', () => {
      const statuses = getNextAvailableStatuses(
        REPORT_STATUSES.SUBMITTED,
        false
      );
      expect(statuses).toEqual([]);
    });

    it('差し戻しの場合、提出済みのみを返す', () => {
      const statuses = getNextAvailableStatuses(
        REPORT_STATUSES.REJECTED,
        false
      );
      expect(statuses).toEqual([REPORT_STATUSES.SUBMITTED]);
    });

    it('承認済みの場合、空配列を返す', () => {
      const statuses = getNextAvailableStatuses(REPORT_STATUSES.APPROVED, true);
      expect(statuses).toEqual([]);
    });
  });

  describe('isValidStatus', () => {
    it('有効なステータスの場合trueを返す', () => {
      expect(isValidStatus('下書き')).toBe(true);
      expect(isValidStatus('提出済み')).toBe(true);
      expect(isValidStatus('承認済み')).toBe(true);
      expect(isValidStatus('差し戻し')).toBe(true);
    });

    it('無効なステータスの場合falseを返す', () => {
      expect(isValidStatus('無効')).toBe(false);
      expect(isValidStatus('')).toBe(false);
    });
  });

  describe('toReportStatus', () => {
    it('有効なステータスの場合、そのステータスを返す', () => {
      expect(toReportStatus('下書き')).toBe(REPORT_STATUSES.DRAFT);
    });

    it('無効なステータスの場合、nullを返す', () => {
      expect(toReportStatus('無効')).toBeNull();
    });
  });
});
