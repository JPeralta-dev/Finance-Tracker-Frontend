/**
 * Analytics API Service — Real backend integration for analytics dashboard.
 *
 * Aggregates 7 backend endpoints with retry logic, error handling, and
 * date-range/bank filter support. Uses HttpClient with exponential backoff
 * retry (2 attempts: 1s, 2s delay).
 *
 * All methods accept optional DateRange and bankId parameters that are
 * serialized as query params.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

// ─── Interfaces ─────────────────────────────────────────────────────────────

/** Date range filter for API calls */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/** API error envelope */
export interface AnalyticsApiError {
  status: number;
  message: string;
  details?: string;
  retryable: boolean;
}

/** Summary response from /api/analytics/summary */
export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  incomeChange: number;
  expenseChange: number;
}

/** Monthly trend response from /api/analytics/monthly-trend */
export interface MonthlyTrend {
  labels: string[];
  income: number[];
  expenses: number[];
}

/** Category breakdown response from /api/analytics/category-breakdown */
export interface CategoryBreakdown {
  categories: {
    categoryId: string;
    category: string;
    amount: number;
    percentage: number;
    color?: string;
  }[];
}

/** Daily spending response from /api/analytics/daily-spending */
export interface DailySpending {
  days: {
    label: string;
    amount: number;
  }[];
}

/** Insight response from /api/analytics/insights */
export interface AnalyticsInsight {
  type: string;
  message: string;
  messageKey: string;
  params?: Record<string, string | number>;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  data?: Record<string, unknown>;
}

/** Transaction response from /api/analytics/transactions */
export interface AnalyticsTransaction {
  id: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  bank: string;
  category: string;
  icon: string;
}

/** Bank response from /api/analytics/banks */
export interface BankInfo {
  id: string;
  name: string;
  logo: string;
}

/** Origin breakdown item from /api/analytics/origin-breakdown */
export interface OriginBreakdownItem {
  origin: string;
  label: string;
  income: number;
  expenses: number;
  total: number;
  count: number;
}

/** Origin breakdown response */
export interface OriginBreakdown {
  origins: OriginBreakdownItem[];
}

/** Hourly activity entry (0-23 hours) */
export interface HourlyActivityEntry {
  hour: number;
  income: number;
  expenses: number;
}

/** Hourly activity response */
export interface HourlyActivityResponse {
  data: HourlyActivityEntry[];
  period: string;
}

/** Weekly pattern entry */
export interface WeeklyPatternEntry {
  weekday: number;
  weekdayLabel: string;
  category: string;
  averageAmount: number;
  count: number;
}

/** Weekly patterns response */
export interface WeeklyPatternsResponse {
  patterns: WeeklyPatternEntry[];
  period: string;
  weeksInRange: number;
}

// ─── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/analytics`;

  /** Retry config: 2 attempts with exponential backoff (1s, 2s) */
  private readonly retryConfig = {
    count: 2,
    delay: (_error: unknown, retryCount: number) => timer(Math.pow(2, retryCount - 1) * 1000),
  };

  /**
   * Build HttpParams from DateRange and optional bankId, type, category.
   */
  private buildParams(range?: DateRange, bankId?: string, type?: string, category?: string): HttpParams {
    let params = new HttpParams();
    if (range) {
      params = params.set('startDate', range.startDate).set('endDate', range.endDate);
    }
    if (bankId) {
      params = params.set('bankId', bankId);
    }
    if (type) {
      params = params.set('type', type);
    }
    if (category) {
      params = params.set('category', category);
    }
    return params;
  }

  /**
   * Transform HTTP errors into AnalyticsApiError objects.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError: AnalyticsApiError = {
      status: error.status,
      message: error.error?.error || error.message || 'Unknown error',
      details: error.error?.details,
      retryable: error.status >= 500 || error.status === 0,
    };
    return throwError(() => apiError);
  }

  // ─── Endpoints ────────────────────────────────────────────────────────────

  /**
   * GET /api/analytics/summary
   * KPI data: income, expenses, savings, rate
   */
  getSummary(range?: DateRange, bankId?: string, type?: string, category?: string): Observable<AnalyticsSummary> {
    return this.http
      .get<AnalyticsSummary>(`${this.base}/summary`, { params: this.buildParams(range, bankId, type, category) })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/monthly-trend
   * Monthly income vs expenses
   */
  getMonthlyTrend(range?: DateRange, bankId?: string, type?: string, category?: string, months: number = 6): Observable<MonthlyTrend> {
    let params = this.buildParams(range, bankId, type, category).set('months', months);
    return this.http
      .get<MonthlyTrend>(`${this.base}/monthly-trend`, { params })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/category-breakdown
   * Spending by category
   */
  getCategoryBreakdown(range?: DateRange, bankId?: string, type?: string, category?: string): Observable<CategoryBreakdown> {
    return this.http
      .get<CategoryBreakdown>(`${this.base}/category-breakdown`, { params: this.buildParams(range, bankId, type, category) })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/daily-spending
   * Daily spending for current week
   */
  getDailySpending(range?: DateRange, bankId?: string, type?: string, category?: string): Observable<DailySpending> {
    return this.http
      .get<DailySpending>(`${this.base}/daily-spending`, { params: this.buildParams(range, bankId, type, category) })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/insights
   * Rule-based insights (or AI later)
   */
  getInsights(range?: DateRange, bankId?: string, type?: string, category?: string): Observable<{ insights: AnalyticsInsight[] }> {
    return this.http
      .get<{ insights: AnalyticsInsight[] }>(`${this.base}/insights`, { params: this.buildParams(range, bankId, type, category) })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/transactions
   * Recent transactions for sidebar
   */
  getRecentTransactions(range?: DateRange, bankId?: string, type?: string, category?: string, limit: number = 10): Observable<{ transactions: AnalyticsTransaction[] }> {
    let params = this.buildParams(range, bankId, type, category).set('limit', limit);
    return this.http
      .get<{ transactions: AnalyticsTransaction[] }>(`${this.base}/transactions`, { params })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/banks
   * Available banks for filter
   */
  getBanks(): Observable<{ banks: BankInfo[] }> {
    return this.http
      .get<{ banks: BankInfo[] }>(`${this.base}/banks`)
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/origin-breakdown
   * Income and expenses grouped by origin
   */
  getOriginBreakdown(range?: DateRange, bankId?: string, type?: string, category?: string): Observable<OriginBreakdown> {
    return this.http
      .get<OriginBreakdown>(`${this.base}/origin-breakdown`, { params: this.buildParams(range, bankId, type, category) })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/hourly-activity
   * Hourly income/expense aggregation (0-23 hours)
   */
  getHourlyActivity(range?: DateRange, bankId?: string, type?: string): Observable<HourlyActivityResponse> {
    return this.http
      .get<HourlyActivityResponse>(`${this.base}/hourly-activity`, { params: this.buildParams(range, bankId, type) })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }

  /**
   * GET /api/analytics/weekly-patterns
   * Weekly transaction patterns with averages
   */
  getWeeklyPatterns(range?: DateRange, bankId?: string, type?: string, category?: string): Observable<WeeklyPatternsResponse> {
    return this.http
      .get<WeeklyPatternsResponse>(`${this.base}/weekly-patterns`, { params: this.buildParams(range, bankId, type, category) })
      .pipe(
        retry(this.retryConfig),
        catchError(this.handleError),
      );
  }
}
