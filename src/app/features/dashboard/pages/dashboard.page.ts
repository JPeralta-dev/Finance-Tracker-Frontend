import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { StatsGridComponent } from '../components/stats-grid/stats-grid.component';
import { AreaChartComponent, AreaDataset } from '../../../shared/charts';
import { DonutChartComponent, DonutData } from '../../../shared/charts';
import { RecentActivityComponent, ActivityItem } from '../components/recent-activity/recent-activity.component';
import { InsightsPanelComponent } from '../components/insights-panel/insights-panel.component';
import { StatCardData } from '../components/stat-card/stat-card.types';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';
import { HoverDepthDirective } from '../../../shared/directives/hover-depth.directive';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Category } from '../../../core/models/category.model';
import { Insight } from '../../../core/models/insight.model';

type DashboardState = 'loading' | 'ready' | 'empty' | 'error';

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
    AreaChartComponent,
    DonutChartComponent,
    RecentActivityComponent,
    InsightsPanelComponent,
    ScrollRevealDirective,
    HoverDepthDirective,
    CountUpDirective,
    EmptyStateComponent,
    TranslatePipe,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);

  readonly stats = signal<StatCardData[]>([]);
  readonly activity = signal<ActivityItem[]>([]);
  readonly insights = signal<Insight[]>([]);
  readonly state = signal<DashboardState>('loading');
  readonly categories = signal<Category[]>([]);

  // Chart data
  readonly chartLabels = signal<string[]>([]);
  readonly chartDatasets = signal<AreaDataset[]>([]);

  // Donut chart data
  readonly donutData = signal<DonutData>({ labels: [], data: [], colors: [] });

  // Greeting based on time of day
  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'dashboard.greeting_morning';
    if (hour < 18) return 'dashboard.greeting_afternoon';
    return 'dashboard.greeting_evening';
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
          this.toast.error('Failed to load dashboard data. Please try again.');
          return;
        }

        if (summary) {
          this.stats.set(this.mapSummary(summary));
        }

        if (chart) {
          const colors = getChartColors();
          this.chartLabels.set(chart.map(d => d.month));
          this.chartDatasets.set([
            { label: 'Income', data: chart.map(d => d.income), color: colors.income },
            { label: 'Expenses', data: chart.map(d => d.expenses), color: colors.expense },
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
            labels: expenseCats.map(c => c.name),
            data: expenseCats.map(c => c.total),
            colors: expenseCats.map((_, i) => colors.categories[i % colors.categories.length]),
          });
        }

        // Set insights
        if (insights && insights.length > 0) {
          this.insights.set(insights);
        }

        // Check if user has any data at all
        const hasData = summary?.totalIncome !== 0 || summary?.totalExpenses !== 0 || (transactions?.length ?? 0) > 0;
        this.state.set(hasData ? 'ready' : 'empty');
      },
      error: () => {
        this.state.set('error');
        this.toast.error('Failed to load dashboard data.');
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
      },
      {
        id: 'expenses',
        label: 'dashboard.monthlyExpenses',
        value: summary.totalExpenses,
        icon: 'expense',
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
}
