/**
 * AnalyticsStore — Signal-based store for analytics state.
 *
 * Manages the analytics dashboard state using Angular signals:
 * - Filter state (date range, bank selection)
 * - Loading/error/ready state machine
 * - Data signals for each analytics domain
 *
 * Uses linkedSignal for derived state and computed for aggregations.
 * All state is immutable — updates create new signal values.
 */

import { Injectable, signal, computed } from '@angular/core';
import type {
  AnalyticsSummary,
  MonthlyTrend,
  CategoryBreakdown,
  DailySpending,
  AnalyticsInsight,
  AnalyticsTransaction,
  BankInfo,
  DateRange,
} from './analytics-api.service';

// ─── State Types ────────────────────────────────────────────────────────────

export type AnalyticsLoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface AnalyticsFilterState {
  dateRange: DateRange | null;
  bankId: string | null;
  period: '7d' | '30d' | '6m' | '1y' | 'custom';
}

// ─── Store ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  // ─── Filter State ───────────────────────────────────────────────────────

  private readonly _filters = signal<AnalyticsFilterState>({
    dateRange: null,
    bankId: null,
    period: '6m',
  });

  readonly filters = this._filters.asReadonly();

  /** Computed API params from current filters */
  readonly apiParams = computed(() => {
    const f = this._filters();
    return {
      range: f.dateRange ?? undefined,
      bankId: f.bankId ?? undefined,
    };
  });

  // ─── Load State ─────────────────────────────────────────────────────────

  private readonly _loadState = signal<AnalyticsLoadState>('idle');
  readonly loadState = this._loadState.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  // ─── Data Signals ───────────────────────────────────────────────────────

  private readonly _summary = signal<AnalyticsSummary | null>(null);
  readonly summary = this._summary.asReadonly();

  private readonly _monthlyTrend = signal<MonthlyTrend | null>(null);
  readonly monthlyTrend = this._monthlyTrend.asReadonly();

  private readonly _categoryBreakdown = signal<CategoryBreakdown | null>(null);
  readonly categoryBreakdown = this._categoryBreakdown.asReadonly();

  private readonly _dailySpending = signal<DailySpending | null>(null);
  readonly dailySpending = this._dailySpending.asReadonly();

  private readonly _insights = signal<AnalyticsInsight[]>([]);
  readonly insights = this._insights.asReadonly();

  private readonly _transactions = signal<AnalyticsTransaction[]>([]);
  readonly transactions = this._transactions.asReadonly();

  private readonly _banks = signal<BankInfo[]>([]);
  readonly banks = this._banks.asReadonly();

  // ─── Computed Derived State ─────────────────────────────────────────────

  /** Whether any data has been loaded */
  readonly hasData = computed(() => {
    return (
      this._summary() !== null ||
      this._monthlyTrend() !== null ||
      (this._categoryBreakdown()?.categories?.length ?? 0) > 0
    );
  });

  /** Whether the user is new (no data at all) */
  readonly isNewUser = computed(() => {
    const s = this._summary();
    if (!s) return false;
    return s.totalIncome === 0 && s.totalExpenses === 0;
  });

  /** Whether current filters return no data */
  readonly isFilteredEmpty = computed(() => {
    return this._loadState() === 'ready' && !this.hasData();
  });

  // ─── Actions ────────────────────────────────────────────────────────────

  /** Set the date period (7d, 30d, 6m, 1y) */
  setPeriod(period: AnalyticsFilterState['period']): void {
    this._filters.update(f => ({ ...f, period, dateRange: null }));
  }

  /** Set a custom date range */
  setDateRange(startDate: string, endDate: string): void {
    this._filters.update(f => ({
      ...f,
      period: 'custom',
      dateRange: { startDate, endDate },
    }));
  }

  /** Set the bank filter */
  setBankId(bankId: string | null): void {
    this._filters.update(f => ({ ...f, bankId }));
  }

  /** Clear all filters to defaults */
  clearFilters(): void {
    this._filters.set({
      dateRange: null,
      bankId: null,
      period: '6m',
    });
  }

  /** Set loading state */
  setLoading(): void {
    this._loadState.set('loading');
    this._error.set(null);
  }

  /** Set ready state */
  setReady(): void {
    this._loadState.set('ready');
  }

  /** Set error state */
  setError(message: string): void {
    this._loadState.set('error');
    this._error.set(message);
  }

  /** Update summary data */
  setSummary(data: AnalyticsSummary): void {
    this._summary.set(data);
  }

  /** Update monthly trend data */
  setMonthlyTrend(data: MonthlyTrend): void {
    this._monthlyTrend.set(data);
  }

  /** Update category breakdown data */
  setCategoryBreakdown(data: CategoryBreakdown): void {
    this._categoryBreakdown.set(data);
  }

  /** Update daily spending data */
  setDailySpending(data: DailySpending): void {
    this._dailySpending.set(data);
  }

  /** Update insights data */
  setInsights(data: AnalyticsInsight[]): void {
    this._insights.set(data);
  }

  /** Update transactions data */
  setTransactions(data: AnalyticsTransaction[]): void {
    this._transactions.set(data);
  }

  /** Update banks data */
  setBanks(data: BankInfo[]): void {
    this._banks.set(data);
  }

  /** Reset all data to initial state */
  reset(): void {
    this._summary.set(null);
    this._monthlyTrend.set(null);
    this._categoryBreakdown.set(null);
    this._dailySpending.set(null);
    this._insights.set([]);
    this._transactions.set([]);
    this._loadState.set('idle');
    this._error.set(null);
  }
}
