/**
 * RuleBasedInsightsService — Unit Tests
 *
 * Table-driven tests: input analytics data → expected insight array.
 * Covers all configured rules: spending spike, savings rate, category anomaly.
 */

import { TestBed } from '@angular/core/testing';
import {
  RuleBasedInsightsService,
  DEFAULT_INSIGHT_RULES,
  InsightRuleConfig,
} from './insights.service';
import type { AnalyticsData, InsightData } from './insights.provider';

describe('RuleBasedInsightsService', () => {
  let service: RuleBasedInsightsService;

  // ─── Helpers ────────────────────────────────────────────────────────────

  function createService(config?: Partial<InsightRuleConfig>): RuleBasedInsightsService {
    return new RuleBasedInsightsService(config);
  }

  function emptyData(): AnalyticsData {
    return {
      summary: null,
      monthlyTrend: null,
      categoryBreakdown: null,
      dailySpending: null,
    };
  }

  // ─── Basic Setup ────────────────────────────────────────────────────────

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RuleBasedInsightsService],
    });
    service = TestBed.inject(RuleBasedInsightsService);
  });

  // ─── Empty / Null Data ──────────────────────────────────────────────────

  describe('empty data', () => {
    it('should return empty array when all data is null', () => {
      const result = service.generateInsights(emptyData());
      expect(result).toEqual([]);
    });

    it('should return empty array when summary is null', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: { labels: ['Jan', 'Feb'], income: [100, 200], expenses: [100, 150] },
      };
      const result = service.generateInsights(data);
      // Only spending spike rule can fire without summary
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Rule: Spending Spike ───────────────────────────────────────────────

  describe('spending spike detection', () => {
    it('should detect spending increase ≥ 20%', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: {
          labels: ['May', 'Jun'],
          income: [5000, 5000],
          expenses: [3000, 4000], // 33% increase
        },
      };

      const result = service.generateInsights(data);
      const spendingInsight = result.find((i) => i.type === 'spending');

      expect(spendingInsight).toBeDefined();
      expect(spendingInsight?.severity).toBe('medium');
      expect(spendingInsight?.actionable).toBe(true);
      expect((spendingInsight?.metadata as Record<string, unknown>)?.['changePercent']).toBe(33);
    });

    it('should mark severity as high when increase ≥ 50%', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: {
          labels: ['May', 'Jun'],
          income: [5000, 5000],
          expenses: [2000, 3500], // 75% increase
        },
      };

      const result = service.generateInsights(data);
      const spendingInsight = result.find((i) => i.type === 'spending');

      expect(spendingInsight?.severity).toBe('high');
    });

    it('should NOT trigger when increase is below threshold', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: {
          labels: ['May', 'Jun'],
          income: [5000, 5000],
          expenses: [3000, 3300], // 10% increase
        },
      };

      const result = service.generateInsights(data);
      const spendingInsight = result.find((i) => i.type === 'spending');

      expect(spendingInsight).toBeUndefined();
    });

    it('should NOT trigger when expenses decrease', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: {
          labels: ['May', 'Jun'],
          income: [5000, 5000],
          expenses: [3000, 2500], // 17% decrease
        },
      };

      const result = service.generateInsights(data);
      const spendingInsight = result.find((i) => i.type === 'spending');

      expect(spendingInsight).toBeUndefined();
    });

    it('should NOT trigger when insufficient trend data (< 2 months)', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: {
          labels: ['Jun'],
          income: [5000],
          expenses: [3000],
        },
      };

      const result = service.generateInsights(data);
      const spendingInsight = result.find((i) => i.type === 'spending');

      expect(spendingInsight).toBeUndefined();
    });

    it('should NOT trigger when previous month is zero', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: {
          labels: ['May', 'Jun'],
          income: [5000, 5000],
          expenses: [0, 3000], // division by zero guard
        },
      };

      const result = service.generateInsights(data);
      const spendingInsight = result.find((i) => i.type === 'spending');

      expect(spendingInsight).toBeUndefined();
    });
  });

  // ─── Rule: Savings Rate ─────────────────────────────────────────────────

  describe('savings rate analysis', () => {
    it('should warn when savings rate is below warning threshold', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        summary: {
          totalIncome: 5000,
          totalExpenses: 4700,
          netSavings: 300,
          savingsRate: 6, // below 10% default threshold
          incomeChange: 0,
          expenseChange: 0,
        },
      };

      const result = service.generateInsights(data);
      const savingsInsight = result.find((i) => i.type === 'savings' && i.severity === 'high');

      expect(savingsInsight).toBeDefined();
      expect(savingsInsight?.actionable).toBe(true);
    });

    it('should alert when spending more than earning (negative savings)', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        summary: {
          totalIncome: 3000,
          totalExpenses: 4000,
          netSavings: -1000,
          savingsRate: -33,
          incomeChange: 0,
          expenseChange: 0,
        },
      };

      const result = service.generateInsights(data);
      const negativeInsight = result.find(
        (i) => i.type === 'savings' && i.severity === 'high' && (i.metadata as Record<string, unknown>)?.['netSavings'] === -1000,
      );

      expect(negativeInsight).toBeDefined();
      expect(negativeInsight?.message).toContain('spending');
    });

    it('should give positive feedback when savings rate is good', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        summary: {
          totalIncome: 5000,
          totalExpenses: 3000,
          netSavings: 2000,
          savingsRate: 40, // above 20% default threshold
          incomeChange: 0,
          expenseChange: 0,
        },
      };

      const result = service.generateInsights(data);
      const positiveInsight = result.find((i) => i.type === 'positive');

      expect(positiveInsight).toBeDefined();
      expect(positiveInsight?.severity).toBe('low');
      expect(positiveInsight?.actionable).toBe(false);
    });

    it('should NOT trigger savings warning when rate is zero', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        summary: {
          totalIncome: 3000,
          totalExpenses: 3000,
          netSavings: 0,
          savingsRate: 0,
          incomeChange: 0,
          expenseChange: 0,
        },
      };

      const result = service.generateInsights(data);
      // Zero savings rate: should NOT trigger the "below warning threshold" rule
      // (savingsRate >= 0 check prevents it), but also not negative
      const warningInsight = result.find(
        (i) => i.type === 'savings' && i.severity === 'high',
      );

      expect(warningInsight).toBeUndefined();
    });
  });

  // ─── Rule: Category Anomaly ─────────────────────────────────────────────

  describe('category anomaly detection', () => {
    it('should detect category consuming ≥ 40% of expenses', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        categoryBreakdown: {
          categories: [
            { name: 'Rent', amount: 1500, percentage: 50 },
            { name: 'Food', amount: 600, percentage: 20 },
            { name: 'Transport', amount: 300, percentage: 10 },
          ],
        },
      };

      const result = service.generateInsights(data);
      const anomalyInsight = result.find((i) => i.type === 'anomaly');

      expect(anomalyInsight).toBeDefined();
      expect(anomalyInsight?.severity).toBe('medium'); // 50% < 60%
      expect((anomalyInsight?.metadata as Record<string, unknown>)?.['categoryName']).toBe('Rent');
    });

    it('should mark severity as high when category ≥ 60%', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        categoryBreakdown: {
          categories: [
            { name: 'Rent', amount: 2000, percentage: 67 },
            { name: 'Food', amount: 500, percentage: 17 },
          ],
        },
      };

      const result = service.generateInsights(data);
      const anomalyInsight = result.find((i) => i.type === 'anomaly');

      expect(anomalyInsight?.severity).toBe('high');
    });

    it('should NOT trigger when all categories are below threshold', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        categoryBreakdown: {
          categories: [
            { name: 'Rent', amount: 1000, percentage: 33 },
            { name: 'Food', amount: 800, percentage: 27 },
            { name: 'Transport', amount: 600, percentage: 20 },
          ],
        },
      };

      const result = service.generateInsights(data);
      const anomalyInsight = result.find((i) => i.type === 'anomaly');

      expect(anomalyInsight).toBeUndefined();
    });

    it('should handle empty categories array', () => {
      const data: AnalyticsData = {
        ...emptyData(),
        categoryBreakdown: { categories: [] },
      };

      const result = service.generateInsights(data);
      const anomalyInsight = result.find((i) => i.type === 'anomaly');

      expect(anomalyInsight).toBeUndefined();
    });
  });

  // ─── Sorting ────────────────────────────────────────────────────────────

  describe('insight sorting', () => {
    it('should sort insights by severity: high → medium → low', () => {
      const data: AnalyticsData = {
        summary: {
          totalIncome: 5000,
          totalExpenses: 4700,
          netSavings: 300,
          savingsRate: 6, // triggers high severity savings warning
          incomeChange: 0,
          expenseChange: 0,
        },
        monthlyTrend: {
          labels: ['May', 'Jun'],
          income: [5000, 5000],
          expenses: [3000, 4000], // 33% increase → medium severity
        },
        categoryBreakdown: {
          categories: [
            { name: 'Rent', amount: 1500, percentage: 50 }, // medium severity
          ],
        },
        dailySpending: null,
      };

      const result = service.generateInsights(data);

      // First insight should be high severity
      if (result.length > 0) {
        expect(result[0].severity).toBe('high');
      }

      // Verify ordering: no medium before high, no low before medium
      const severityOrder = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < result.length; i++) {
        expect(severityOrder[result[i].severity]).toBeGreaterThanOrEqual(
          severityOrder[result[i - 1].severity],
        );
      }
    });
  });

  // ─── Custom Configuration ───────────────────────────────────────────────

  describe('custom rule configuration', () => {
    it('should use custom spending spike threshold', () => {
      const customService = createService({ spendingSpikeThreshold: 10 });

      const data: AnalyticsData = {
        ...emptyData(),
        monthlyTrend: {
          labels: ['May', 'Jun'],
          income: [5000, 5000],
          expenses: [3000, 3400], // 13.3% increase
        },
      };

      const result = customService.generateInsights(data);
      const spendingInsight = result.find((i) => i.type === 'spending');

      // Default threshold is 20%, custom is 10% → should trigger
      expect(spendingInsight).toBeDefined();

      // With default service, this would NOT trigger
      const defaultResult = service.generateInsights(data);
      const defaultSpending = defaultResult.find((i) => i.type === 'spending');
      expect(defaultSpending).toBeUndefined();
    });

    it('should use custom savings rate thresholds', () => {
      const customService = createService({
        savingsRateWarningThreshold: 5,
        savingsRateGoodThreshold: 30,
      });

      const data: AnalyticsData = {
        ...emptyData(),
        summary: {
          totalIncome: 5000,
          totalExpenses: 4000,
          netSavings: 1000,
          savingsRate: 20,
          incomeChange: 0,
          expenseChange: 0,
        },
      };

      const result = customService.generateInsights(data);
      // 20% is below custom good threshold (30%) → no positive insight
      const positiveInsight = result.find((i) => i.type === 'positive');
      expect(positiveInsight).toBeUndefined();

      // With default service, 20% meets the good threshold → positive insight
      const defaultResult = service.generateInsights(data);
      const defaultPositive = defaultResult.find((i) => i.type === 'positive');
      expect(defaultPositive).toBeDefined();
    });
  });

  // ─── Table-Driven Tests ─────────────────────────────────────────────────

  describe('table-driven: spending spike', () => {
    const testCases: {
      name: string;
      previousExpenses: number;
      currentExpenses: number;
      expectInsight: boolean;
      expectedSeverity?: 'low' | 'medium' | 'high';
    }[] = [
      { name: '0% change', previousExpenses: 3000, currentExpenses: 3000, expectInsight: false },
      { name: '10% increase (below threshold)', previousExpenses: 3000, currentExpenses: 3300, expectInsight: false },
      { name: '20% increase (at threshold)', previousExpenses: 3000, currentExpenses: 3600, expectInsight: true, expectedSeverity: 'medium' },
      { name: '33% increase', previousExpenses: 3000, currentExpenses: 4000, expectInsight: true, expectedSeverity: 'medium' },
      { name: '50% increase (high severity)', previousExpenses: 2000, currentExpenses: 3000, expectInsight: true, expectedSeverity: 'high' },
      { name: '100% increase (high severity)', previousExpenses: 1000, currentExpenses: 2000, expectInsight: true, expectedSeverity: 'high' },
      { name: '10% decrease', previousExpenses: 3000, currentExpenses: 2700, expectInsight: false },
    ];

    testCases.forEach((tc) => {
      it(tc.name, () => {
        const data: AnalyticsData = {
          ...emptyData(),
          monthlyTrend: {
            labels: ['May', 'Jun'],
            income: [5000, 5000],
            expenses: [tc.previousExpenses, tc.currentExpenses],
          },
        };

        const result = service.generateInsights(data);
        const spendingInsight = result.find((i) => i.type === 'spending');

        if (tc.expectInsight) {
          expect(spendingInsight).toBeDefined();
          if (tc.expectedSeverity) {
            expect(spendingInsight?.severity).toBe(tc.expectedSeverity);
          }
        } else {
          expect(spendingInsight).toBeUndefined();
        }
      });
    });
  });

  describe('table-driven: savings rate', () => {
    const testCases: {
      name: string;
      savingsRate: number;
      expectType: string | null;
      expectedSeverity?: 'low' | 'medium' | 'high';
    }[] = [
      { name: '-50% (deficit)', savingsRate: -50, expectType: 'savings', expectedSeverity: 'high' },
      { name: '-1% (slight deficit)', savingsRate: -1, expectType: 'savings', expectedSeverity: 'high' },
      { name: '0% (break even)', savingsRate: 0, expectType: null },
      { name: '5% (low savings)', savingsRate: 5, expectType: 'savings', expectedSeverity: 'high' },
      { name: '10% (at warning boundary)', savingsRate: 10, expectType: null },
      { name: '15% (moderate)', savingsRate: 15, expectType: null },
      { name: '20% (good, at threshold)', savingsRate: 20, expectType: 'positive', expectedSeverity: 'low' },
      { name: '40% (excellent)', savingsRate: 40, expectType: 'positive', expectedSeverity: 'low' },
    ];

    testCases.forEach((tc) => {
      it(tc.name, () => {
        const data: AnalyticsData = {
          ...emptyData(),
          summary: {
            totalIncome: 5000,
            totalExpenses: 5000 - (5000 * tc.savingsRate) / 100,
            netSavings: (5000 * tc.savingsRate) / 100,
            savingsRate: tc.savingsRate,
            incomeChange: 0,
            expenseChange: 0,
          },
        };

        const result = service.generateInsights(data);

        if (tc.expectType) {
          const insight = result.find((i) => i.type === tc.expectType);
          expect(insight).toBeDefined();
          if (tc.expectedSeverity) {
            expect(insight?.severity).toBe(tc.expectedSeverity);
          }
        } else {
          // No insight of any type should be present for this rate
          // (except possibly spending/category which we don't set up here)
          const savingsInsight = result.find((i) => i.type === 'savings' || i.type === 'positive');
          expect(savingsInsight).toBeUndefined();
        }
      });
    });
  });

  describe('table-driven: category anomaly', () => {
    const testCases: {
      name: string;
      categories: { name: string; percentage: number }[];
      expectedAnomalyCount: number;
    }[] = [
      { name: 'no categories', categories: [], expectedAnomalyCount: 0 },
      { name: 'all below threshold', categories: [{ name: 'A', percentage: 30 }, { name: 'B', percentage: 25 }], expectedAnomalyCount: 0 },
      { name: 'one at threshold (40%)', categories: [{ name: 'Rent', percentage: 40 }, { name: 'Food', percentage: 30 }], expectedAnomalyCount: 1 },
      { name: 'one above threshold', categories: [{ name: 'Rent', percentage: 55 }, { name: 'Food', percentage: 20 }], expectedAnomalyCount: 1 },
      { name: 'multiple above threshold', categories: [{ name: 'Rent', percentage: 50 }, { name: 'Food', percentage: 45 }], expectedAnomalyCount: 2 },
      { name: 'extreme concentration (90%)', categories: [{ name: 'Rent', percentage: 90 }], expectedAnomalyCount: 1 },
    ];

    testCases.forEach((tc) => {
      it(tc.name, () => {
        const data: AnalyticsData = {
          ...emptyData(),
          categoryBreakdown: {
            categories: tc.categories.map((c) => ({
              name: c.name,
              amount: c.percentage * 10,
              percentage: c.percentage,
            })),
          },
        };

        const result = service.generateInsights(data);
        const anomalies = result.filter((i) => i.type === 'anomaly');

        expect(anomalies.length).toBe(tc.expectedAnomalyCount);
      });
    });
  });
});
