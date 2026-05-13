export interface StatCardData {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  /** Icon name from the icon registry (e.g. 'wallet', 'income') */
  icon?: string;
  insight?: string;
}
