import { describe, it, expect } from 'vitest';
import {
  isManager,
  isSalesStaff,
  hasRole,
  hasAnyRole,
  isOwnReport,
  canViewReport,
  canEditReport,
  canDeleteReport,
  canApproveReport,
  canViewSalesMaster,
  canEditSalesMaster,
  canEditCustomerMaster,
  canPostComment,
  canDeleteComment,
  isValidRole,
} from '@/lib/utils/permissions';
import { ROLES } from '@/lib/constants';
import type { SessionUser } from '@/lib/auth';

describe('権限チェック関数', () => {
  const managerUser: SessionUser = {
    salesId: 1,
    role: ROLES.MANAGER,
    department: '営業部',
    name: '上長太郎',
    email: 'manager@example.com',
  };

  const salesUser: SessionUser = {
    salesId: 2,
    role: ROLES.SALES,
    department: '営業部',
    name: '営業花子',
    email: 'sales@example.com',
  };

  describe('isManager', () => {
    it('上長の場合trueを返す', () => {
      expect(isManager(managerUser)).toBe(true);
    });

    it('一般営業の場合falseを返す', () => {
      expect(isManager(salesUser)).toBe(false);
    });

    it('nullの場合falseを返す', () => {
      expect(isManager(null)).toBe(false);
    });

    it('undefinedの場合falseを返す', () => {
      expect(isManager(undefined)).toBe(false);
    });
  });

  describe('isSalesStaff', () => {
    it('一般営業の場合trueを返す', () => {
      expect(isSalesStaff(salesUser)).toBe(true);
    });

    it('上長の場合falseを返す', () => {
      expect(isSalesStaff(managerUser)).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('指定されたロールを持っている場合trueを返す', () => {
      expect(hasRole(managerUser, ROLES.MANAGER)).toBe(true);
      expect(hasRole(salesUser, ROLES.SALES)).toBe(true);
    });

    it('指定されたロールを持っていない場合falseを返す', () => {
      expect(hasRole(managerUser, ROLES.SALES)).toBe(false);
      expect(hasRole(salesUser, ROLES.MANAGER)).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('指定されたロールのいずれかを持っている場合trueを返す', () => {
      expect(hasAnyRole(managerUser, [ROLES.MANAGER, ROLES.SALES])).toBe(true);
      expect(hasAnyRole(salesUser, [ROLES.MANAGER, ROLES.SALES])).toBe(true);
    });

    it('指定されたロールのいずれも持っていない場合falseを返す', () => {
      expect(hasAnyRole(salesUser, [ROLES.MANAGER])).toBe(false);
    });

    it('nullの場合falseを返す', () => {
      expect(hasAnyRole(null, [ROLES.MANAGER, ROLES.SALES])).toBe(false);
    });
  });

  describe('isOwnReport', () => {
    it('自分の日報の場合trueを返す', () => {
      expect(isOwnReport(salesUser, 2)).toBe(true);
    });

    it('他人の日報の場合falseを返す', () => {
      expect(isOwnReport(salesUser, 1)).toBe(false);
    });

    it('nullの場合falseを返す', () => {
      expect(isOwnReport(null, 1)).toBe(false);
    });
  });

  describe('canViewReport', () => {
    it('自分の日報は閲覧可能', () => {
      expect(canViewReport(salesUser, 2)).toBe(true);
    });

    it('上長は配下メンバーの日報を閲覧可能', () => {
      expect(canViewReport(managerUser, 2, true)).toBe(true);
    });

    it('上長でも配下メンバーでない日報は閲覧不可', () => {
      expect(canViewReport(managerUser, 2, false)).toBe(false);
    });

    it('一般営業は他人の日報を閲覧不可', () => {
      expect(canViewReport(salesUser, 1, false)).toBe(false);
    });
  });

  describe('canEditReport', () => {
    it('自分の下書き日報は編集可能', () => {
      expect(canEditReport(salesUser, 2, '下書き')).toBe(true);
    });

    it('自分の差し戻し日報は編集可能', () => {
      expect(canEditReport(salesUser, 2, '差し戻し')).toBe(true);
    });

    it('自分の提出済み日報は編集不可', () => {
      expect(canEditReport(salesUser, 2, '提出済み')).toBe(false);
    });

    it('他人の日報は編集不可', () => {
      expect(canEditReport(salesUser, 1, '下書き')).toBe(false);
    });
  });

  describe('canDeleteReport', () => {
    it('自分の下書き日報は削除可能', () => {
      expect(canDeleteReport(salesUser, 2, '下書き')).toBe(true);
    });

    it('自分の提出済み日報は削除不可', () => {
      expect(canDeleteReport(salesUser, 2, '提出済み')).toBe(false);
    });

    it('他人の下書き日報は削除不可', () => {
      expect(canDeleteReport(salesUser, 1, '下書き')).toBe(false);
    });
  });

  describe('canApproveReport', () => {
    it('上長は配下メンバーの提出済み日報を承認可能', () => {
      expect(canApproveReport(managerUser, 2, '提出済み', true)).toBe(true);
    });

    it('上長でも自分の日報は承認不可', () => {
      expect(canApproveReport(managerUser, 1, '提出済み', true)).toBe(false);
    });

    it('上長でも配下メンバーでない日報は承認不可', () => {
      expect(canApproveReport(managerUser, 2, '提出済み', false)).toBe(false);
    });

    it('上長でも下書き日報は承認不可', () => {
      expect(canApproveReport(managerUser, 2, '下書き', true)).toBe(false);
    });

    it('一般営業は日報を承認不可', () => {
      expect(canApproveReport(salesUser, 1, '提出済み', true)).toBe(false);
    });
  });

  describe('canViewSalesMaster', () => {
    it('上長は営業マスタを閲覧可能', () => {
      expect(canViewSalesMaster(managerUser)).toBe(true);
    });

    it('一般営業は営業マスタを閲覧不可', () => {
      expect(canViewSalesMaster(salesUser)).toBe(false);
    });
  });

  describe('canEditSalesMaster', () => {
    it('上長は営業マスタを編集可能', () => {
      expect(canEditSalesMaster(managerUser)).toBe(true);
    });

    it('一般営業は営業マスタを編集不可', () => {
      expect(canEditSalesMaster(salesUser)).toBe(false);
    });
  });

  describe('canEditCustomerMaster', () => {
    it('ログインユーザーは顧客マスタを編集可能', () => {
      expect(canEditCustomerMaster(salesUser)).toBe(true);
      expect(canEditCustomerMaster(managerUser)).toBe(true);
    });

    it('未ログインユーザーは顧客マスタを編集不可', () => {
      expect(canEditCustomerMaster(null)).toBe(false);
    });
  });

  describe('canPostComment', () => {
    it('日報を閲覧できるユーザーはコメント投稿可能', () => {
      expect(canPostComment(salesUser, 2)).toBe(true);
      expect(canPostComment(managerUser, 2, true)).toBe(true);
    });
  });

  describe('canDeleteComment', () => {
    it('自分のコメントは削除可能', () => {
      expect(canDeleteComment(salesUser, 2)).toBe(true);
    });

    it('他人のコメントは削除不可', () => {
      expect(canDeleteComment(salesUser, 1)).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('有効なロールの場合trueを返す', () => {
      expect(isValidRole('上長')).toBe(true);
      expect(isValidRole('一般営業')).toBe(true);
    });

    it('無効なロールの場合falseを返す', () => {
      expect(isValidRole('無効')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });
  });
});
