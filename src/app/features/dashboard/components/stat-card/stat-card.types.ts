export interface StatCardData {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  /** Explicit sign prefix for income (+)/expense (−). Doubles color coding. */
  sign?: '+' | '-';
  trend?: number;
  /** Icon name from the icon registry (e.g. 'wallet', 'income') */
  icon?: string;
  insight?: string;
}
