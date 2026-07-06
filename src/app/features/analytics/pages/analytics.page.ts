import {
  Component,
  signal,
  inject,
  OnInit,
  computed,
  effect,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { catchError, forkJoin, of, tap } from 'rxjs';

// ─── ECharts ────────────────────────────────────────────────────────────────
import { FtEChartComponent, ChartClickEvent } from '../../../shared/charts';
import { EchartsThemeMapper } from '../../../shared/charts/echarts/echarts-theme.mapper';
import type { EChartsOption } from 'echarts';

// ─── Orphaned Components ────────────────────────────────────────────────────
import { AnalyticsHeaderComponent, PeriodOption } from '../components/analytics-header/analytics-header.component';
import { AnalyticsKpisComponent } from '../components/analytics-kpis/analytics-kpis.component';
import { AnalyticsFiltersComponent } from '../components/analytics-filters/analytics-filters.component';
import { AnalyticsInsightsComponent } from '../components/analytics-insights/analytics-insights.component';
import { AnalyticsComparisonComponent } from '../components/analytics-comparison/analytics-comparison.component';
import { AnalyticsTransactionsComponent } from '../components/analytics-transactions/analytics-transactions.component';
import { AnalyticsMonthStoryComponent } from '../components/analytics-month-story/analytics-month-story.component';
import { AnalyticsCategoryBreakdownComponent } from '../components/analytics-category-breakdown/analytics-category-breakdown.component';
import { AnalyticsChartCardComponent } from '../components/analytics-chart-card/analytics-chart-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';

// ─── Services ───────────────────────────────────────────────────────────────
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnalyticsApiService, AnalyticsSummary, MonthlyTrend, CategoryBreakdown, DailySpending, AnalyticsInsight, AnalyticsTransaction, BankInfo, DateRange } from '../services/analytics-api.service';
import { AnalyticsStore } from '../services/analytics.store';
import { ICONS } from '../../../shared/icons/icon-registry';
import { DateRangeService } from '../../../core/services/date-range.service';

// ─── Types ──────────────────────────────────────────────────────────────────
import type { KpiData, MonthStory, CategoryAnalysis, ComparisonData, InsightData as UiInsightData, RelevantTransaction } from '../analytics.types';

// ─── Pure helpers ───────────────────────────────────────────────────────────

/** Map backend day abbreviations (Mon–Sun) to i18n keys */
const DAY_KEY_MAP: Record<string, string> = {
  Mon: 'analytics.days.mon',
  Tue: 'analytics.days.tue',
  Wed: 'analytics.days.wed',
  Thu: 'analytics.days.thu',
  Fri: 'analytics.days.fri',
  Sat: 'analytics.days.sat',
  Sun: 'analytics.days.sun',
};

/** Map API summary + trend to KpiData array */
export function mapToKpis(
  summary: AnalyticsSummary | null,
  trend: MonthlyTrend | null,
  currencySymbol: string,
  i18n: TranslationService,
): KpiData[] {
  const t = i18n.translate.bind(i18n);

  // Defensive: detect if summary is wrapped (backend bug) or null
  const hasValidData = summary && typeof summary.totalIncome === 'number';
  if (!hasValidData) {
    return [
      { icon: 'trendingUp', labelKey: 'analytics.totalIncome', value: 0, prefix: currencySymbol, trend: 0 },
      { icon: 'trendingDown', labelKey: 'analytics.totalExpenses', value: 0, prefix: currencySymbol, trend: 0 },
      { icon: 'wallet', labelKey: 'analytics.netSavings', value: 0, prefix: currencySymbol, trend: 0 },
      { icon: 'percent', labelKey: 'analytics.savingsRate', value: 0, suffix: '%', trend: 0 },
    ];
  }

  const lastIncome = trend?.income?.[trend.income.length - 1] ?? 0;
  const prevIncome = trend?.income?.[trend.income.length - 2] ?? lastIncome;
  const lastExpense = trend?.expenses?.[trend.expenses.length - 1] ?? 0;
  const prevExpense = trend?.expenses?.[trend.expenses.length - 2] ?? lastExpense;

  const incomeChange = prevIncome > 0 ? ((lastIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpense > 0 ? ((lastExpense - prevExpense) / prevExpense) * 100 : 0;

  return [
    {
      icon: 'trendingUp',
      labelKey: 'analytics.totalIncome',
      value: summary.totalIncome,
      prefix: currencySymbol,
      trend: incomeChange,
    },
    {
      icon: 'trendingDown',
      labelKey: 'analytics.totalExpenses',
      value: summary.totalExpenses,
      prefix: currencySymbol,
      trend: -expenseChange, // expense increase is negative
    },
    {
      icon: 'wallet',
      labelKey: 'analytics.netSavings',
      value: summary.netSavings,
      prefix: currencySymbol,
      trend: summary.savingsRate,
    },
    {
      icon: 'percent',
      labelKey: 'analytics.savingsRate',
      value: Math.max(0, summary.savingsRate),
      suffix: '%',
      trend: summary.savingsRate - 15, // vs 15% target
    },
  ];
}

/** Map API category breakdown to CategoryAnalysis array */
export function mapToCategoryAnalysis(
  breakdown: CategoryBreakdown | null,
  colors: string[],
  i18n: TranslationService,
): CategoryAnalysis[] {
  if (!breakdown?.categories) return [];

  const icons: Record<string, string> = {
    food: 'food', transport: 'car', entertainment: 'gamepad',
    shopping: 'bag', health: 'heart', education: 'book',
    housing: 'home', utilities: 'zap', salary: 'briefcase',
    freelance: 'code', investment: 'trendingUp', other: 'circle',
  };

  return breakdown.categories
    .filter(cat => cat.category) // Skip categories with null/undefined names
    .map((cat, i) => ({
      id: cat.categoryId,
      name: i18n.translate(cat.category),
      icon: icons[cat.category.toLowerCase()] ?? 'other',
      color: colors[i % colors.length],
      total: cat.amount,
      percentage: cat.percentage,
      change: 0, // Would need historical data; placeholder for now
      trend: 'stable' as const,
    }));
}

/** Map API summary to ComparisonData */
export function mapToComparisons(
  summary: AnalyticsSummary | null,
  currencySymbol: string,
  i18n: TranslationService,
): ComparisonData[] {
  const hasValidData = summary && typeof summary.totalIncome === 'number';
  if (!hasValidData) {
    return [
      { labelKey: 'analytics.comparison.income', current: 0, previous: 0, percentChange: 0, trend: 'stable' },
      { labelKey: 'analytics.comparison.expenses', current: 0, previous: 0, percentChange: 0, trend: 'stable' },
    ];
  }

  const currentIncome = summary.totalIncome;
  const prevIncome = summary.incomeChange !== 0
    ? currentIncome / (1 + summary.incomeChange / 100)
    : currentIncome;
  const currentExpense = summary.totalExpenses;
  const prevExpense = summary.expenseChange !== 0
    ? currentExpense / (1 + summary.expenseChange / 100)
    : currentExpense;

  return [
    {
      labelKey: 'analytics.comparison.income',
      current: currentIncome,
      previous: Math.round(prevIncome),
      percentChange: summary.incomeChange,
      trend: summary.incomeChange >= 0 ? 'up' : 'down',
    },
    {
      labelKey: 'analytics.comparison.expenses',
      current: currentExpense,
      previous: Math.round(prevExpense),
      percentChange: summary.expenseChange,
      trend: summary.expenseChange <= 0 ? 'down' : 'up',
    },
  ];
}

/** Map API transactions to UI RelevantTransaction */
export function mapToRelevantTransactions(
  txs: AnalyticsTransaction[],
): RelevantTransaction[] {
  return txs.map(tx => ({
    id: tx.id,
    description: tx.merchant,
    category: tx.category,
    amount: Math.abs(tx.amount),
    type: tx.type,
    date: tx.date,
    icon: tx.icon || 'circle',
  }));
}

/** Map API insights to UI InsightData */
export function mapToUiInsights(
  insights: AnalyticsInsight[],
  i18n: TranslationService,
): UiInsightData[] {
  const iconMap: Record<string, string> = {
    spending: 'trendingUp', savings: 'wallet', anomaly: 'alertTriangle',
    positive: 'star', subscription: 'repeat',
    warning: 'alertTriangle', info: 'info', success: 'star', trend: 'trendingUp',
  };
  const typeMap: Record<string, 'success' | 'warning' | 'info' | 'trend'> = {
    high: 'warning', medium: 'info', low: 'success',
    warning: 'warning', info: 'info', success: 'success', trend: 'trend',
  };

  return insights.map(ins => ({
    icon: iconMap[ins.type] ?? 'info',
    titleKey: `analytics.insight.${ins.type}`,
    messageKey: ins.messageKey,
    params: ins.params || (ins.data as Record<string, number | string> | undefined),
    type: typeMap[ins.severity] ?? typeMap[ins.type] ?? 'info',
    severity: ins.severity,
  }));
}

/** Generate month story from summary + trend */
export function generateMonthStories(
  summary: AnalyticsSummary | null,
  trend: MonthlyTrend | null,
  i18n: TranslationService,
): MonthStory[] {
  const stories: MonthStory[] = [];
  const hasValidData = summary && typeof summary.savingsRate === 'number';
  if (!hasValidData) {
    stories.push({
      icon: 'info',
      messageKey: 'analytics.story.noData',
      type: 'neutral',
    });
    return stories;
  }

  const t = i18n.translate.bind(i18n);

  if (summary.savingsRate >= 20) {
    stories.push({
      icon: 'star',
      messageKey: 'analytics.story.greatSavings',
      params: { rate: Math.round(summary.savingsRate) },
      type: 'positive',
    });
  } else if (summary.savingsRate < 0) {
    stories.push({
      icon: 'alertTriangle',
      messageKey: 'analytics.story.negativeSavings',
      params: { rate: Math.round(Math.abs(summary.savingsRate)) },
      type: 'negative',
    });
  }

  if (trend?.expenses && trend.expenses.length >= 2) {
    const current = trend.expenses[trend.expenses.length - 1];
    const prev = trend.expenses[trend.expenses.length - 2];
    if (prev > 0 && current > prev * 1.2) {
      stories.push({
        icon: 'trendingUp',
        messageKey: 'analytics.story.spendingSpike',
        params: { amount: Math.round(current) },
        type: 'info',
      });
    }
  }

  if (stories.length === 0) {
    stories.push({
      icon: 'info',
      messageKey: 'analytics.story.noNotableEvents',
      type: 'neutral',
    });
  }

  return stories;
}

// ─── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'ft-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    FtEChartComponent,
    FtSubtleRevealDirective,
    EmptyStateComponent,
    ClickOutsideDirective,
    TranslatePipe,
    AnalyticsHeaderComponent,
    AnalyticsKpisComponent,
    AnalyticsFiltersComponent,
    AnalyticsInsightsComponent,
    AnalyticsComparisonComponent,
    AnalyticsTransactionsComponent,
    AnalyticsMonthStoryComponent,
    AnalyticsCategoryBreakdownComponent,
    AnalyticsChartCardComponent,
  ],
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPage implements OnInit {
  readonly store = inject(AnalyticsStore);
  private readonly api = inject(AnalyticsApiService);
  private readonly themeMapper = inject(EchartsThemeMapper);
  private readonly currencyService = inject(CurrencyService);
  private readonly i18n = inject(TranslationService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dateRange = inject(DateRangeService);

  /** Period options for the header buttons */
  readonly periodOptions: { value: PeriodOption; labelKey: string }[] = [
    { value: '1m', labelKey: 'analytics.period.1m' },
    { value: '3m', labelKey: 'analytics.period.3m' },
    { value: '6m', labelKey: 'analytics.period.6m' },
    { value: '1y', labelKey: 'analytics.period.1y' },
  ];

  // ─── Derived signals from store ─────────────────────────────────────────

  readonly kpis = computed<KpiData[]>(() =>
    mapToKpis(
      this.store.summary(),
      this.store.monthlyTrend(),
      this.currencyService.currencyConfig().symbol,
      this.i18n,
    ),
  );

  readonly categoryAnalysis = computed<CategoryAnalysis[]>(() =>
    mapToCategoryAnalysis(
      this.store.categoryBreakdown(),
      this.themeMapper.categoryColors(),
      this.i18n,
    ),
  );

  readonly comparisons = computed<ComparisonData[]>(() =>
    mapToComparisons(
      this.store.summary(),
      this.currencyService.currencyConfig().symbol,
      this.i18n,
    ),
  );

  readonly uiTransactions = computed<RelevantTransaction[]>(() =>
    mapToRelevantTransactions(this.store.transactions()),
  );

  readonly uiInsights = computed<UiInsightData[]>(() =>
    mapToUiInsights(this.store.insights(), this.i18n),
  );

  readonly monthStories = computed<MonthStory[]>(() =>
    generateMonthStories(this.store.summary(), this.store.monthlyTrend(), this.i18n),
  );

  readonly banks = computed<BankInfo[]>(() => this.store.banks());

  /** Pre-computed category names for the filters component (Angular templates can't call .map()) */
  readonly categoryNames = computed<string[]>(() =>
    this.categoryAnalysis().map(c => c.name),
  );

  /** Safe variation value for the header — avoids optional chaining warning and empty-array crash */
  readonly headerVariation = computed<number | null>(() => {
    const kpi = this.kpis();
    return kpi.length > 0 ? kpi[0].trend : null;
  });

  // ─── ECharts options (computed) ─────────────────────────────────────────

  readonly trendChartOptions = computed<EChartsOption | undefined>(() => {
    const trend = this.store.monthlyTrend();
    if (!trend || trend.labels.length === 0) return undefined;

    const colors = this.themeMapper.categoryColors();
    return this.themeMapper.buildAreaOption(
      trend.labels,
      [
        { label: this.i18n.translate('transactions.form.income'), data: trend.income, color: colors[7] }, // success green
        { label: this.i18n.translate('transactions.form.expense'), data: trend.expenses.map(e => Math.abs(e)), color: colors[4] }, // danger red
      ],
    );
  });

  readonly donutChartOptions = computed<EChartsOption | undefined>(() => {
    const breakdown = this.store.categoryBreakdown();
    if (!breakdown?.categories || breakdown.categories.length === 0) return undefined;

    return this.themeMapper.buildDonutOption(
      breakdown.categories.filter(c => c.category).map(c => this.i18n.translate(c.category)),
      breakdown.categories.filter(c => c.category).map(c => c.amount),
    );
  });

  readonly dailyChartOptions = computed<EChartsOption | undefined>(() => {
    const daily = this.store.dailySpending();
    if (!daily?.days || daily.days.length === 0) return undefined;

    const colors = this.themeMapper.categoryColors();
    return this.themeMapper.buildBarOption(
      daily.days.map(d => this.i18n.translate(DAY_KEY_MAP[d.label] ?? d.label)),
      [{ label: this.i18n.translate('analytics.dailySpending'), data: daily.days.map(d => d.amount), color: colors[2] }],
    );
  });

  // ─── Hourly Activity Chart ──────────────────────────────────────────────

  private readonly _hourlyData = signal<{ data: { hour: number; income: number; expenses: number }[] } | null>(null);
  readonly hourlyData = this._hourlyData.asReadonly();

  readonly hourlyChartOptions = computed<EChartsOption | undefined>(() => {
    const data = this._hourlyData();
    if (!data || data.data.length === 0) return undefined;

    const hours = data.data.map(h => h.hour);
    const incomeData = data.data.map(h => h.income);
    const expenseData = data.data.map(h => h.expenses);
    const currencySymbol = this.currencyService.currencyConfig().symbol;

    return this.themeMapper.buildHourlyBarOption(hours, incomeData, expenseData, currencySymbol);
  });

  // ─── Weekly Patterns Chart (with averages) ──────────────────────────────

  private readonly _weeklyPatterns = signal<{ patterns: { weekday: number; weekdayLabel: string; category: string; averageAmount: number; count: number }[] } | null>(null);
  readonly weeklyPatterns = this._weeklyPatterns.asReadonly();

  readonly weeklyPatternsChartOptions = computed<EChartsOption | undefined>(() => {
    const data = this._weeklyPatterns();
    if (!data || data.patterns.length === 0) return undefined;

    // Group by weekday label, sum averages across categories
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap = new Map<string, number>();
    for (const p of data.patterns) {
      const current = dayMap.get(p.weekdayLabel) ?? 0;
      dayMap.set(p.weekdayLabel, current + p.averageAmount);
    }

    const labels = dayOrder.map(d => this.i18n.translate(DAY_KEY_MAP[d] ?? d));
    const values = dayOrder.map(d => dayMap.get(d) ?? 0);

    const colors = this.themeMapper.categoryColors();
    return this.themeMapper.buildWeeklyPatternsOption(
      labels,
      [{ label: this.i18n.translate('analytics.weeklyAverage'), data: values, color: colors[3] }],
      this.i18n.translate('analytics.weeklyAverage'),
    );
  });

  // ─── State helpers ──────────────────────────────────────────────────────

  readonly isLoading = computed(() => this.store.loadState() === 'loading');
  readonly isError = computed(() => this.store.loadState() === 'error');
  readonly isNewUser = computed(() => this.store.isNewUser());

  readonly monthOpen = signal(false);

  /** Show content layout whenever data is loaded — even with zero values */
  readonly showContent = computed(() => this.store.loadState() === 'ready');

  readonly pageState = computed<'loading' | 'error' | 'content'>(() => {
    if (this.isLoading()) return 'loading';
    if (this.isError()) return 'error';
    return 'content';
  });

  readonly errorMessage = computed(() => this.store.error());

  // ─── Filter state (two-way with filters component) ──────────────────────

  /** Map store period to header PeriodOption */
  readonly headerPeriod = computed<PeriodOption>(() => {
    const p = this.store.filters().period;
    if (p === '7d' || p === '30d') return '1m';
    if (p === '90d') return '3m';
    if (p === '1y') return '1y';
    return '6m'; // default
  });

  readonly filterBankId = computed(() => this.store.filters().bankId);

  /** Human-readable date range display */
  readonly dateRangeDisplay = computed<string>(() => {
    const params = this.store.apiParams();
    const range = params.range;
    if (!range) return '';

    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} — ${endStr}`;
  });

  /** Custom date inputs (derived from store) */
  readonly customStartDate = computed<string>(() => {
    const range = this.store.filters().dateRange;
    return range?.startDate?.split('T')[0] ?? '';
  });

  readonly customEndDate = computed<string>(() => {
    const range = this.store.filters().dateRange;
    return range?.endDate?.split('T')[0] ?? '';
  });

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  constructor() {
    // React to filter changes and reload data
    effect(() => {
      const params = this.store.apiParams();
      this.loadData(params.range, params.bankId, params.type, params.category);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.loadBanks();
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  onPeriodChange(period: PeriodOption): void {
    // Map header period to store period
    const storePeriod: '7d' | '30d' | '90d' | '6m' | '1y' =
      period === '1m' ? '30d' :
      period === '3m' ? '90d' :
      period === '1y' ? '1y' : '6m';
    this.store.setPeriod(storePeriod);
    // Clear chart filters when changing period
    this.onClearChartFilters();
  }

  onBankChange(bankId: string | null): void {
    this.store.setBankId(bankId);
  }

  onFiltersReset(): void {
    this.store.clearFilters();
  }

  toggleMonthDropdown(): void {
    this.monthOpen.update(v => !v);
  }

  onMonthSelect(month: { start: string; end: string }): void {
    this.dateRange.setMonth(month.start, month.end);
    this.store.setDateRange(month.start, month.end);
    this.monthOpen.set(false);
  }

  /** Handle custom date range from header inputs */
  onCustomDateChange({ start, end }: { start: string; end: string }): void {
    if (start && end) {
      // Convert to UTC ISO strings with proper boundaries
      const startDate = new Date(start + 'T00:00:00Z').toISOString();
      const endDate = new Date(end + 'T23:59:59Z').toISOString();
      this.store.setDateRange(startDate, endDate);
    }
  }

  /** Handle chart click events for drill-down filtering */
  onChartClick(event: ChartClickEvent, chartType: 'category' | 'hourly' | 'weekly'): void {
    if (chartType === 'category' && event.name) {
      // Donut/bar click → filter by category name
      // Map display name back to category ID
      const analysis = this.categoryAnalysis();
      const matched = analysis.find(c => c.name === event.name);
      if (matched) {
        this.store.setCrossFilterCategory(matched.id, matched.name);
      }
    } else if (chartType === 'hourly' && event.hour !== undefined) {
      // Hourly chart click → filter by hour
      this.store.setChartFilter({
        type: 'hour',
        value: event.hour,
        label: `${event.hour}:00`,
      });
    } else if (chartType === 'weekly' && event.name) {
      // Weekly patterns click → filter by day
      const dayKeyMapReverse: Record<string, string> = {
        'analytics.days.mon': 'Mon',
        'analytics.days.tue': 'Tue',
        'analytics.days.wed': 'Wed',
        'analytics.days.thu': 'Thu',
        'analytics.days.fri': 'Fri',
        'analytics.days.sat': 'Sat',
        'analytics.days.sun': 'Sun',
      };
      const dayLabel = dayKeyMapReverse[event.name] ?? event.name;
      this.store.setChartFilter({
        type: 'category',
        value: dayLabel,
        label: event.name,
      });
    }
  }

  /** Clear all chart filters */
  onClearChartFilters(): void {
    this.store.clearChartFilter();
    this.store.clearCrossFilter();
  }

  retry(): void {
    const params = this.store.apiParams();
    this.loadData(params.range, params.bankId, params.type, params.category);
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private loadBanks(): void {
    this.api.getBanks().pipe(
      catchError(() => of({ banks: [] })),
    ).subscribe({
      next: (res) => this.store.setBanks(res.banks),
    });
  }

  private loadData(range?: DateRange, bankId?: string, type?: string, category?: string): void {
    this.store.setLoading();

    // Core analytics only — new endpoints load separately
    forkJoin({
      summary: this.api.getSummary(range, bankId, type, category).pipe(catchError(() => of(null))),
      trend: this.api.getMonthlyTrend(range, bankId, type, category).pipe(catchError(() => of(null))),
      categoryBreakdown: this.api.getCategoryBreakdown(range, bankId, type, category).pipe(catchError(() => of(null))),
      dailySpending: this.api.getDailySpending(range, bankId, type, category).pipe(catchError(() => of(null))),
      insights: this.api.getInsights(range, bankId, type, category).pipe(
        catchError(() => of({ insights: [] })),
      ),
      transactions: this.api.getRecentTransactions(range, bankId, type, category).pipe(
        catchError(() => of({ transactions: [] })),
      ),
    }).subscribe({
      next: ({ summary, trend, categoryBreakdown, dailySpending, insights, transactions }) => {
        if (summary) this.store.setSummary(summary);
        if (trend) this.store.setMonthlyTrend(trend);
        if (categoryBreakdown) this.store.setCategoryBreakdown(categoryBreakdown);
        if (dailySpending) this.store.setDailySpending(dailySpending);
        if (insights?.insights) this.store.setInsights(insights.insights);
        if (transactions?.transactions) this.store.setTransactions(transactions.transactions);

        this.store.setReady();

        // Load optional charts separately — do not block core analytics
        this.loadOptionalCharts(range, bankId, type, category);
      },
      error: (err) => {
        const msg = err?.message || this.i18n.translate('analytics.errorDesc');
        this.store.setError(msg);
        this.toast.error(msg);
      },
    });
  }

  /** Load new chart endpoints separately — safe to fail without breaking the page */
  private loadOptionalCharts(range?: DateRange, bankId?: string, type?: string, category?: string): void {
    forkJoin({
      hourlyActivity: this.api.getHourlyActivity(range, bankId, type).pipe(catchError(() => of(null))),
      weeklyPatterns: this.api.getWeeklyPatterns(range, bankId, type, category).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ hourlyActivity, weeklyPatterns }) => {
        if (hourlyActivity) this._hourlyData.set(hourlyActivity);
        if (weeklyPatterns) this._weeklyPatterns.set(weeklyPatterns);
      },
    });
  }
}
