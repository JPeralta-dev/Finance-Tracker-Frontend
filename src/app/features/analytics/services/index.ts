/**
 * Analytics Services — Barrel Export
 */

export { AnalyticsApiService } from './analytics-api.service';
export type {
  DateRange,
  AnalyticsApiError,
  AnalyticsSummary,
  MonthlyTrend,
  CategoryBreakdown,
  DailySpending,
  AnalyticsInsight,
  AnalyticsTransaction,
  BankInfo,
} from './analytics-api.service';

export { AnalyticsStore } from './analytics.store';
export type { AnalyticsLoadState, AnalyticsFilterState } from './analytics.store';

export { RuleBasedInsightsService, DEFAULT_INSIGHT_RULES } from './insights.service';
export type { InsightRuleConfig } from './insights.service';

export type { InsightProvider, InsightData, AnalyticsData, InsightSeverity, InsightType } from './insights.provider';
export { AIInsightsService } from './insights.provider';
