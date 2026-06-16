/**
 * InsightProvider — Swap-ready interface for analytics insights.
 *
 * Defines the contract that any insight generator must implement.
 * The current implementation is RuleBasedInsightsService; a future
 * AIInsightsService can replace it without touching components.
 *
 * Components depend on InsightProvider, not concrete implementations.
 */

import type {
  AnalyticsSummary,
  MonthlyTrend,
  CategoryBreakdown,
  DailySpending,
} from './analytics-api.service';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Severity level for an insight */
export type InsightSeverity = 'low' | 'medium' | 'high';

/** Insight category for filtering/grouping */
export type InsightType = 'spending' | 'savings' | 'subscription' | 'anomaly' | 'positive';

/** Single insight generated from analytics data */
export interface InsightData {
  /** Machine-readable type for filtering */
  type: InsightType;
  /** Human-readable message (i18n key or plain text) */
  message: string;
  /** How urgent this insight is */
  severity: InsightSeverity;
  /** Whether the user can take action on this insight */
  actionable: boolean;
  /** Optional metadata for the consuming component */
  metadata?: Record<string, unknown>;
}

/** Aggregated analytics data passed to insight generators */
export interface AnalyticsData {
  summary: AnalyticsSummary | null;
  monthlyTrend: MonthlyTrend | null;
  categoryBreakdown: CategoryBreakdown | null;
  dailySpending: DailySpending | null;
}

// ─── Interface ──────────────────────────────────────────────────────────────

/**
 * Contract for insight generators.
 *
 * Implement this interface to produce insights from analytics data.
 * Swap implementations via DI without changing component code.
 */
export interface InsightProvider {
  /**
   * Generate insights from aggregated analytics data.
   *
   * @param data - Aggregated analytics data from all endpoints
   * @returns Array of insights, ordered by severity (high first)
   */
  generateInsights(data: AnalyticsData): InsightData[];
}

// ─── Stub for future AI implementation ──────────────────────────────────────

/**
 * Placeholder for future AI-powered insights.
 * Implements InsightProvider — swap via DI token when ready.
 */
export class AIInsightsService implements InsightProvider {
  generateInsights(_data: AnalyticsData): InsightData[] {
    // TODO: Implement AI-powered insight generation
    // This stub allows DI to resolve without breaking the app
    return [];
  }
}
