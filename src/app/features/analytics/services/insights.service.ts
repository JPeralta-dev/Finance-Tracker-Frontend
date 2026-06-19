/**
 * RuleBasedInsightsService — Configurable rule engine for analytics insights.
 *
 * Implements InsightProvider with deterministic rules:
 * - Spending spike detection (≥20% increase vs previous period)
 * - Savings rate drop alerts
 * - Category anomaly detection (single category >40% of expenses)
 * - Positive reinforcement (savings rate >20%)
 *
 * Rules are configurable via thresholds that can be injected or overridden.
 */

import { Injectable } from '@angular/core';
import type { InsightProvider, InsightData, AnalyticsData, InsightSeverity, InsightType } from './insights.provider';

// ─── Rule Configuration ─────────────────────────────────────────────────────

export interface InsightRuleConfig {
  /** Percentage increase to trigger spending spike alert (default: 20) */
  spendingSpikeThreshold: number;
  /** Savings rate below this triggers a warning (default: 10) */
  savingsRateWarningThreshold: number;
  /** Savings rate above this triggers positive feedback (default: 20) */
  savingsRateGoodThreshold: number;
  /** Category percentage above this triggers anomaly alert (default: 40) */
  categoryAnomalyThreshold: number;
}

/** Default rule thresholds */
export const DEFAULT_INSIGHT_RULES: InsightRuleConfig = {
  spendingSpikeThreshold: 20,
  savingsRateWarningThreshold: 10,
  savingsRateGoodThreshold: 20,
  categoryAnomalyThreshold: 40,
};

// ─── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RuleBasedInsightsService implements InsightProvider {
  private config: InsightRuleConfig = { ...DEFAULT_INSIGHT_RULES };

  constructor() {}

  /**
   * Override default rule thresholds at runtime.
   * Useful for tests or future AI integration.
   */
  configure(overrides: Partial<InsightRuleConfig>): void {
    this.config = { ...DEFAULT_INSIGHT_RULES, ...overrides };
  }

  /**
   * Generate insights from aggregated analytics data.
   *
   * Applies all configured rules and returns insights sorted by severity.
   */
  generateInsights(data: AnalyticsData): InsightData[] {
    const insights: InsightData[] = [];

    // Rule 1: Spending spike detection
    insights.push(...this.checkSpendingSpike(data));

    // Rule 2: Savings rate analysis
    insights.push(...this.checkSavingsRate(data));

    // Rule 3: Category anomaly detection
    insights.push(...this.checkCategoryAnomaly(data));

    // Sort by severity (high → medium → low)
    const severityOrder: Record<InsightSeverity, number> = { high: 0, medium: 1, low: 2 };
    return insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  // ─── Rule: Spending Spike ───────────────────────────────────────────────

  /**
   * Detect spending spikes by comparing recent months.
   * Triggers when expenses increase ≥ threshold% vs previous period.
   */
  private checkSpendingSpike(data: AnalyticsData): InsightData[] {
    const insights: InsightData[] = [];
    const trend = data.monthlyTrend;

    if (!trend?.expenses?.length || trend.expenses.length < 2) return insights;

    const expenses = trend.expenses;
    const currentMonth = expenses[expenses.length - 1];
    const previousMonth = expenses[expenses.length - 2];

    if (previousMonth === 0) return insights;

    const changePercent = ((currentMonth - previousMonth) / previousMonth) * 100;

    if (changePercent >= this.config.spendingSpikeThreshold) {
      insights.push({
        type: 'spending' as InsightType,
        message: `Spending increased ${Math.round(changePercent)}% vs last month`,
        severity: changePercent >= 50 ? 'high' : 'medium',
        actionable: true,
        metadata: {
          changePercent: Math.round(changePercent),
          currentAmount: currentMonth,
          previousAmount: previousMonth,
          threshold: this.config.spendingSpikeThreshold,
        },
      });
    }

    return insights;
  }

  // ─── Rule: Savings Rate ─────────────────────────────────────────────────

  /**
   * Analyze savings rate and generate warnings or positive feedback.
   */
  private checkSavingsRate(data: AnalyticsData): InsightData[] {
    const insights: InsightData[] = [];
    const summary = data.summary;

    if (!summary) return insights;

    const savingsRate = summary.savingsRate;

    // Warning: savings rate too low
    if (savingsRate < this.config.savingsRateWarningThreshold && savingsRate >= 0) {
      insights.push({
        type: 'savings' as InsightType,
        message: `Savings rate is only ${Math.round(savingsRate)}% — consider reducing expenses`,
        severity: 'high',
        actionable: true,
        metadata: {
          savingsRate: Math.round(savingsRate),
          threshold: this.config.savingsRateWarningThreshold,
        },
      });
    }

    // Negative: spending more than earning
    if (savingsRate < 0) {
      insights.push({
        type: 'savings' as InsightType,
        message: `You're spending ${Math.round(Math.abs(savingsRate))}% more than you earn`,
        severity: 'high',
        actionable: true,
        metadata: {
          savingsRate: Math.round(savingsRate),
          netSavings: summary.netSavings,
        },
      });
    }

    // Positive: good savings rate
    if (savingsRate >= this.config.savingsRateGoodThreshold) {
      insights.push({
        type: 'positive' as InsightType,
        message: `Great job! Savings rate of ${Math.round(savingsRate)}% is above target`,
        severity: 'low',
        actionable: false,
        metadata: {
          savingsRate: Math.round(savingsRate),
          threshold: this.config.savingsRateGoodThreshold,
        },
      });
    }

    return insights;
  }

  // ─── Rule: Category Anomaly ─────────────────────────────────────────────

  /**
   * Detect categories consuming an unusually high percentage of expenses.
   */
  private checkCategoryAnomaly(data: AnalyticsData): InsightData[] {
    const insights: InsightData[] = [];
    const breakdown = data.categoryBreakdown;

    if (!breakdown || !breakdown.categories || breakdown.categories.length === 0) return insights;

    for (const category of breakdown.categories) {
      if (category.percentage >= this.config.categoryAnomalyThreshold) {
        insights.push({
          type: 'anomaly' as InsightType,
          message: `${category.name} accounts for ${Math.round(category.percentage)}% of expenses`,
          severity: category.percentage >= 60 ? 'high' : 'medium',
          actionable: true,
          metadata: {
            categoryName: category.name,
            percentage: Math.round(category.percentage),
            amount: category.amount,
            threshold: this.config.categoryAnomalyThreshold,
          },
        });
      }
    }

    return insights;
  }
}
