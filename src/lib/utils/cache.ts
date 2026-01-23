/**
 * パフォーマンス最適化のためのキャッシュユーティリティ
 *
 * N+1問題の解消とキャッシング戦略の実装
 */

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * 配下メンバーのIDを取得する（キャッシュ対応）
 *
 * 上長の配下メンバーIDを取得し、一定時間キャッシュします。
 * これにより、同じリクエスト内での重複クエリを防ぎます。
 *
 * @param managerId 上長のsalesId
 * @returns 配下メンバーのsalesId配列
 */
export const getSubordinateIds = unstable_cache(
  async (managerId: number): Promise<number[]> => {
    const subordinates = await prisma.sales.findMany({
      where: { managerId },
      select: { salesId: true },
    });
    return subordinates.map((s) => s.salesId);
  },
  ['subordinate-ids'],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ['sales'],
  }
);

/**
 * 上長が閲覧可能な営業担当者IDリストを取得（キャッシュ対応）
 *
 * 上長自身のIDと配下メンバーのIDを含むリストを返します。
 *
 * @param managerId 上長のsalesId
 * @returns 閲覧可能なsalesId配列（自分自身を含む）
 */
export async function getAllowedSalesIds(managerId: number): Promise<number[]> {
  const subordinateIds = await getSubordinateIds(managerId);
  return [managerId, ...subordinateIds];
}

/**
 * 顧客一覧を取得する（キャッシュ対応）
 *
 * セレクトボックス用の顧客リストをキャッシュして提供します。
 *
 * @returns 顧客リスト（ID、名前、会社名）
 */
export const getCustomerListForSelect = unstable_cache(
  async () => {
    return prisma.customer.findMany({
      select: {
        customerId: true,
        customerName: true,
        companyName: true,
        industry: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    });
  },
  ['customer-list-select'],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ['customers'],
  }
);

/**
 * 営業担当者リストを取得する（キャッシュ対応）
 *
 * 上長が配下メンバーをフィルタリングするためのリストを提供します。
 *
 * @param managerId 上長のsalesId
 * @returns 営業担当者リスト（自分自身と配下メンバー）
 */
export const getSalesListForManager = unstable_cache(
  async (managerId: number) => {
    return prisma.sales.findMany({
      where: {
        OR: [{ salesId: managerId }, { managerId: managerId }],
      },
      select: {
        salesId: true,
        salesName: true,
      },
      orderBy: {
        salesName: 'asc',
      },
    });
  },
  ['sales-list-manager'],
  {
    revalidate: 300, // 5分間キャッシュ
    tags: ['sales'],
  }
);
