export interface AnalyticsFiltersState {
  period: '1m' | '3m' | '6m' | '1y' | 'custom';
  startDate: string | null;
  endDate: string | null;
  category: string | null;
  type: 'all' | 'income' | 'expense';
  account: string | null;
  tags: string[];
}

export interface KpiData {
  icon: string;
  labelKey: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: number;
  chart?: number[];
}

export interface MonthStory {
  icon: string;
  messageKey: string;
  params?: Record<string, number | string>;
  type: 'positive' | 'negative' | 'neutral' | 'info';
}

export interface CategoryAnalysis {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percentage: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ComparisonData {
  labelKey: string;
  current: number;
  previous: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
}

export interface InsightData {
  icon: string;
  titleKey: string;
  messageKey: string;
  params?: Record<string, number | string>;
  type: 'success' | 'warning' | 'info' | 'trend';
  severity: 'low' | 'medium' | 'high';
}

export interface RelevantTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  icon: string;
  note?: string;
}
