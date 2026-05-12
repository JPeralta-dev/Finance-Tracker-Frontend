/**
 * Transaction UI types for the Obsidian Glass design system.
 */

export interface TransactionRowData {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  icon?: string;
  status?: 'completed' | 'pending' | 'failed';
}

export type TransactionFilter = 'all' | 'income' | 'expense';

export type SortField = 'date' | 'amount' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface CategoryMeta {
  icon: string;
  color: string;
  bg: string;
}
