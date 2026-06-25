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
import { FtEChartComponent } from '../../../shared/charts';
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

// ─── Services ───────────────────────────────────────────────────────────────
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnalyticsApiService, AnalyticsSummary, MonthlyTrend, CategoryBreakdown, DailySpending, AnalyticsInsight, AnalyticsTransaction, BankInfo, DateRange, OriginBreakdown } from '../services/analytics-api.service';
import { AnalyticsStore } from '../services/analytics.store';
import { ICONS } from '../../../shared/icons/icon-registry';

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

  readonly originDonutOptions = computed<EChartsOption | undefined>(() => {
    const breakdown = this.store.originBreakdown();
    if (!breakdown?.origins || breakdown.origins.length === 0) return undefined;
    return this.themeMapper.buildDonutOption(
      breakdown.origins.map(o => o.label),
      breakdown.origins.map(o => o.total),
    );
  });

  readonly originBarOptions = computed<EChartsOption | undefined>(() => {
    const breakdown = this.store.originBreakdown();
    if (!breakdown?.origins || breakdown.origins.length === 0) return undefined;
    const colors = this.themeMapper.categoryColors();
    return this.themeMapper.buildBarOption(
      breakdown.origins.map(o => o.label),
      [
        { label: this.i18n.translate('transactions.form.income'), data: breakdown.origins.map(o => o.income), color: colors[7] },
        { label: this.i18n.translate('transactions.form.expense'), data: breakdown.origins.map(o => o.expenses), color: colors[4] },
      ],
    );
  });

  // ─── State helpers ──────────────────────────────────────────────────────

  readonly isLoading = computed(() => this.store.loadState() === 'loading');
  readonly isError = computed(() => this.store.loadState() === 'error');
  readonly isNewUser = computed(() => this.store.isNewUser());

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
    if (p === '7d' || p === '30d') return '1m'; // Map short periods to 1m
    if (p === '1y') return '1y';
    return '6m'; // default
  });

  readonly filterBankId = computed(() => this.store.filters().bankId);

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
    const storePeriod: '7d' | '30d' | '6m' | '1y' =
      period === '1m' ? '30d' :
      period === '3m' ? '30d' :
      period === '1y' ? '1y' : '6m';
    this.store.setPeriod(storePeriod);
  }

  onBankChange(bankId: string | null): void {
    this.store.setBankId(bankId);
  }

  onFiltersReset(): void {
    this.store.clearFilters();
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
      originBreakdown: this.api.getOriginBreakdown(range, bankId, type, category).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ summary, trend, categoryBreakdown, dailySpending, insights, transactions, originBreakdown }) => {
        if (summary) this.store.setSummary(summary);
        if (trend) this.store.setMonthlyTrend(trend);
        if (categoryBreakdown) this.store.setCategoryBreakdown(categoryBreakdown);
        if (dailySpending) this.store.setDailySpending(dailySpending);
        if (insights?.insights) this.store.setInsights(insights.insights);
        if (transactions?.transactions) this.store.setTransactions(transactions.transactions);
        if (originBreakdown) this.store.setOriginBreakdown(originBreakdown);

        // Insights come from the backend API only (Spanish, rule-based)
        // No frontend merge — avoids duplicate English messages

        this.store.setReady();
      },
      error: (err) => {
        const msg = err?.message || this.i18n.translate('analytics.errorDesc');
        this.store.setError(msg);
        this.toast.error(msg);
      },
    });
  }
}
