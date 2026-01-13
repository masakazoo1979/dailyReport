/**
 * Customers types
 *
 * Type definitions for the Customer Master feature
 * Based on doc/screen-specification.md and doc/api-specification.md
 */

import {
  Industry,
  CustomerListItem,
  PaginationInfo,
  CustomersFilter,
  CustomerFormValues,
} from '@/lib/validations/customers';

// Re-export validation types for convenience
export type {
  Industry,
  CustomerListItem,
  PaginationInfo,
  CustomersFilter,
  CustomerFormValues,
};

/**
 * Customers table sort configuration
 */
export interface CustomersSortConfig {
  field: 'company_name' | 'customer_name' | 'industry' | 'created_at';
  order: 'asc' | 'desc';
}

/**
 * Customers filter form values
 */
export interface CustomersFilterFormValues {
  company_name?: string;
  industry?: Industry | 'すべて';
}

/**
 * Customers list page props
 */
export interface CustomersListPageProps {
  searchParams?: {
    page?: string;
    per_page?: string;
    company_name?: string;
    industry?: string;
    sort?: string;
    order?: string;
  };
}
