export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  kind?: 'income' | 'expense' | 'mixed';
}
