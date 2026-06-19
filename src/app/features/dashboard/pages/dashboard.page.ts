import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { StatsGridComponent } from '../components/stats-grid/stats-grid.component';
import { FtEChartComponent, EchartsThemeMapper } from '../../../shared/charts';
import { RecentActivityComponent, ActivityItem } from '../components/recent-activity/recent-activity.component';
import { InsightsPanelComponent } from '../../../shared/components/insights-panel/insights-panel.component';
import { StatCardData } from '../components/stat-card/stat-card.types';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { HoverDepthDirective } from '../../../shared/directives/hover-depth.directive';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { CategoryTranslatePipe } from '../../../core/pipes/category-translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { Category } from '../../../core/models/category.model';
import { Insight } from '../../../core/models/insight.model';
import type { EChartsOption } from 'echarts';

type DashboardState = 'loading' | 'ready' | 'error';

// ─── Temporary types (Phase 3 will replace with ECharts types) ────────────

interface AreaDataset {
  label: string;
  data: number[];
  color: string;
}

interface DonutData {
  labels: string[];
  data: number[];
  colors: string[];
}

// Theme-aware chart colors (reads from CSS custom properties)
// Module-level cache to avoid repeated getComputedStyle calls
interface ChartColors {
  income: string;
  expense: string;
  categories: string[];
}

let cachedColors: ChartColors | null = null;

function getChartColors(): ChartColors {
  if (cachedColors) return cachedColors;
  const style = getComputedStyle(document.documentElement);
  const get = (name: string) => style.getPropertyValue(name).trim();
  cachedColors = {
    income: get('--success') || '#06D6A0',
    expense: get('--danger') || '#FF6B6B',
    categories: [
      get('--accent-start') || '#9D50BB',
      get('--accent-mid') || '#7B42F6',
      get('--accent-end') || '#6E48AA',
      get('--info') || '#A78BFA',
      get('--danger') || '#FF6B6B',
      '#FF9E7D', '#FFD166', get('--success') || '#06D6A0', '#4DA6FF', '#A3A3A3',
    ],
  };
  return cachedColors;
}

@Component({
  selector: 'ft-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatsGridComponent,
    FtEChartComponent,
    RecentActivityComponent,
    InsightsPanelComponent,
    FtSubtleRevealDirective,
    HoverDepthDirective,
    EmptyStateComponent,
    TranslatePipe,
    CategoryTranslatePipe,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly themeMapper = inject(EchartsThemeMapper);

  readonly stats = signal<StatCardData[]>([]);
  readonly activity = signal<ActivityItem[]>([]);
  readonly insights = signal<Insight[]>([]);
  readonly state = signal<DashboardState>('loading');
  readonly categories = signal<Category[]>([]);

  // Date range selector
  readonly selectedRange = signal<string>('30d');
  readonly dateRanges = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
  ];

  // Chart data
  readonly chartLabels = signal<string[]>([]);
  readonly chartDatasets = signal<AreaDataset[]>([]);

  // Donut chart data
  readonly donutData = signal<DonutData>({ labels: [], data: [], colors: [] });

  // ECharts options (computed)
  readonly areaChartOptions = computed<EChartsOption | undefined>(() => {
    const labels = this.chartLabels();
    const datasets = this.chartDatasets();
    if (labels.length === 0 || datasets.length === 0) return undefined;
    return this.themeMapper.buildAreaOption(labels, datasets);
  });

  readonly donutChartOptions = computed<EChartsOption | undefined>(() => {
    const data = this.donutData();
    if (data.labels.length === 0 || data.data.length === 0) return undefined;
    return this.themeMapper.buildDonutOption(data.labels, data.data);
  });

  // Greeting based on time of day
  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'dashboard.greeting_morning';
    if (hour < 18) return 'dashboard.greeting_afternoon';
    return 'dashboard.greeting_evening';
  });

  // Whether the user has any real transaction data (non-zero values)
  readonly hasData = computed(() => {
    const s = this.stats();
    if (s.length === 0) return false;
    return s.some(stat => stat.value !== 0);
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.state.set('loading');

    forkJoin({
      summary: this.financeService.getSummary().pipe(catchError(() => of(null))),
      chart: this.financeService.getMonthlyChart().pipe(catchError(() => of(null))),
      transactions: this.financeService.getTransactions({ limit: 5, sortBy: 'date', sortDir: 'desc' }).pipe(catchError(() => of(null))),
      categories: this.financeService.getCategories().pipe(catchError(() => of([]))),
      insights: this.financeService.getInsights().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ summary, chart, transactions, categories, insights }) => {
        if (!summary && !chart && !transactions) {
          this.state.set('error');
          this.toast.error(this.i18n.translate('common.toasts.dashboard_load_failed'));
          return;
        }

        // Defensive: check if summary has valid shape (backend might wrap it)
        const hasValidSummary = summary && typeof summary.totalIncome === 'number';
        if (hasValidSummary) {
          this.stats.set(this.mapSummary(summary));
        } else {
          // Show zero stats so the layout is always visible
          this.stats.set(this.mapSummary({ totalBalance: 0, totalIncome: 0, totalExpenses: 0, savingsRate: 0 }));
        }

        if (chart && chart.length > 0) {
          const colors = getChartColors();
          this.chartLabels.set(chart.map(d => d.month));
          this.chartDatasets.set([
            { label: this.i18n.translate('transactions.form.income'), data: chart.map(d => d.income), color: colors.income },
            { label: this.i18n.translate('transactions.form.expense'), data: chart.map(d => d.expenses), color: colors.expense },
          ]);
        }

        if (transactions && transactions.length > 0) {
          this.activity.set(transactions.map(t => ({
            id: t.id,
            description: t.description,
            category: t.category,
            amount: t.amount,
            type: t.type,
            date: t.date,
          })));
        }

        // Process categories for donut chart (expense categories only)
        if (categories && categories.length > 0) {
          this.categories.set(categories);
          const expenseCats = categories.filter(c => c.kind === 'expense' || c.kind === 'mixed').filter(c => c.total > 0);
          const colors = getChartColors();
          this.donutData.set({
            labels: expenseCats.map(c => this.i18n.translate(c.name)),
            data: expenseCats.map(c => c.total),
            colors: expenseCats.map((_, i) => colors.categories[i % colors.categories.length]),
          });
        }

        // Set insights
        if (insights && insights.length > 0) {
          this.insights.set(insights);
        }

        // Always show ready state — even with zero data so the user sees the full layout
        this.state.set('ready');
      },
      error: () => {
        this.state.set('error');
        this.toast.error(this.i18n.translate('common.toasts.dashboard_load_failed_short'));
      },
    });
  }

  private mapSummary(summary: { totalBalance: number; totalIncome: number; totalExpenses: number; savingsRate: number }): StatCardData[] {
    return [
      {
        id: 'balance',
        label: 'dashboard.totalBalance',
        value: summary.totalBalance,
        icon: 'wallet',
        insight: summary.totalBalance > 0 ? 'dashboard.positiveBalance' : 'dashboard.noBalance',
      },
      {
        id: 'income',
        label: 'dashboard.monthlyIncome',
        value: summary.totalIncome,
        icon: 'income',
        sign: '+',
      },
      {
        id: 'expenses',
        label: 'dashboard.monthlyExpenses',
        value: summary.totalExpenses,
        icon: 'expense',
        sign: '-',
      },
      {
        id: 'savings',
        label: 'dashboard.savingsRate',
        value: summary.savingsRate,
        suffix: '%',
        icon: 'subscription',
        insight: summary.savingsRate > 20 ? 'dashboard.onTrack' : summary.savingsRate > 0 ? 'dashboard.couldImprove' : undefined,
      },
    ];
  }

  retry(): void {
    this.loadData();
  }

  setRange(range: string): void {
    this.selectedRange.set(range);
  }
}
