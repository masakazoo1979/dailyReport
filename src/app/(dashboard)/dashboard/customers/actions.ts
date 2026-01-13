'use server';

/**
 * Server Actions for Customers List
 *
 * Based on:
 * - doc/screen-specification.md S-006 顧客マスタ一覧画面
 * - doc/api-specification.md GET /customers
 */

import { prisma } from '@/lib/prisma';
import {
  customersFilterSchema,
  type CustomersListResponse,
} from '@/lib/validations/customers';
import { Prisma } from '@prisma/client';

/**
 * Fetch customers list with filters and pagination
 *
 * Based on doc/api-specification.md GET /customers
 *
 * Query Parameters:
 * - company_name: string (部分一致検索)
 * - industry: string (業種)
 * - page: number (ページ番号)
 * - per_page: number (1ページあたり件数)
 * - sort: string (ソート対象フィールド)
 * - order: string (ソート順: asc/desc)
 *
 * Access Control:
 * - All authenticated users can view customer list
 *
 * @param params - Filter parameters from URL search params
 * @returns Customers list with pagination
 */
export async function fetchCustomers(
  params: URLSearchParams
): Promise<CustomersListResponse> {
  try {
    // Parse and validate filter parameters
    const rawFilters = {
      company_name: params.get('company_name') || undefined,
      industry: params.get('industry') || undefined,
      page: params.get('page') || '1',
      per_page: params.get('per_page') || '20',
      sort: params.get('sort') || 'company_name',
      order: params.get('order') || 'asc',
    };

    const filters = customersFilterSchema.parse(rawFilters);

    // Build WHERE clause based on filters
    const where: Prisma.CustomerWhereInput = {};

    // Company name filter (partial match)
    if (filters.company_name) {
      where.companyName = {
        contains: filters.company_name,
        mode: 'insensitive', // Case-insensitive search
      };
    }

    // Industry filter
    if (filters.industry && filters.industry !== 'すべて') {
      where.industry = filters.industry;
    }

    // Count total records
    const total = await prisma.customer.count({ where });

    // Calculate pagination
    const totalPages = Math.ceil(total / filters.per_page);
    const skip = (filters.page - 1) * filters.per_page;

    // Build ORDER BY clause
    const orderBy: Prisma.CustomerOrderByWithRelationInput = {};
    if (filters.sort === 'company_name') {
      orderBy.companyName = filters.order;
    } else if (filters.sort === 'customer_name') {
      orderBy.customerName = filters.order;
    } else if (filters.sort === 'industry') {
      orderBy.industry = filters.order;
    } else if (filters.sort === 'created_at') {
      orderBy.createdAt = filters.order;
    }

    // Fetch customers
    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      skip,
      take: filters.per_page,
    });

    // Transform data to match API response format
    const data = customers.map((customer) => ({
      customer_id: customer.customerId,
      customer_name: customer.customerName,
      company_name: customer.companyName,
      industry: customer.industry as
        | 'IT'
        | '製造'
        | '金融'
        | '小売'
        | 'サービス'
        | 'その他'
        | null,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      created_at: customer.createdAt.toISOString(),
      updated_at: customer.updatedAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        total,
        page: filters.page,
        per_page: filters.per_page,
        total_pages: totalPages,
      },
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('顧客情報の取得中にエラーが発生しました');
  }
}
