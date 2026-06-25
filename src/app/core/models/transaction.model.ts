export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string; // ISO
  createdAt: string;
  bank?: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  bankId?: string;
}

export interface TransactionFilters {
  category?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'category';
  sortDir?: 'asc' | 'desc';
}
