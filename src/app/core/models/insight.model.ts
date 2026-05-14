export interface Insight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'trend';
  titleKey: string;
  messageKey: string;
  severity: 'low' | 'medium' | 'high';
  data?: Record<string, number | string>;
}
