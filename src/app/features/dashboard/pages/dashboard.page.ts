import { Component, signal, inject, OnInit, computed, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { StatsGridComponent } from '../components/stats-grid/stats-grid.component';
import { FtEChartComponent, EchartsThemeMapper } from '../../../shared/charts';
import { RecentActivityComponent, ActivityItem } from '../components/recent-activity/recent-activity.component';
import { StatCardData } from '../components/stat-card/stat-card.types';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { HoverDepthDirective } from '../../../shared/directives/hover-depth.directive';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import type { EChartsOption } from 'echarts';

type DashboardState = 'loading' | 'ready' | 'error';

interface AreaDataset {
  label: string;
  data: number[];
  color: string;
}

@Injectable({ providedIn: 'root' })
class ChartColorCache {
  private cache: { income: string; expense: string } | null = null;
  get() {
    if (this.cache) return this.cache;
    const style = getComputedStyle(document.documentElement);
    const get = (name: string) => style.getPropertyValue(name).trim();
    this.cache = {
      income: get('--success') || '#06D6A0',
      expense: get('--danger') || '#FF6B6B',
    };
    return this.cache;
  }
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
    FtSubtleRevealDirective,
    HoverDepthDirective,
    EmptyStateComponent,
    TranslatePipe,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);
  readonly i18n = inject(TranslationService);
  private readonly themeMapper = inject(EchartsThemeMapper);
  private readonly chartColors = inject(ChartColorCache);

  readonly stats = signal<StatCardData[]>([]);
  readonly activity = signal<ActivityItem[]>([]);
  readonly state = signal<DashboardState>('loading');

  readonly selectedRange = signal<string>('30d');
  readonly dateRanges = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
  ];

  readonly chartLabels = signal<string[]>([]);
  readonly chartDatasets = signal<AreaDataset[]>([]);

  readonly areaChartOptions = computed<EChartsOption | undefined>(() => {
    const labels = this.chartLabels();
    const datasets = this.chartDatasets();
    if (labels.length === 0 || datasets.length === 0) return undefined;
    return this.themeMapper.buildAreaOption(labels, datasets);
  });

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'home.greeting_morning';
    if (hour < 18) return 'home.greeting_afternoon';
    return 'home.greeting_evening';
  });

  readonly today = computed(() => {
    return new Date().toLocaleDateString(this.i18n.currentLang() === 'es' ? 'es-AR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  });

  readonly hasData = computed(() => {
    const s = this.stats();
    if (s.length === 0) return false;
    return s.some(stat => stat.value !== 0);
  });

  ngOnInit(): void {
    this.loadData(this.selectedRange());
  }

  private computeDateRange(range: string): { startDate: string; endDate: string } | null {
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '6m': startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); break;
      case '1y': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: return null;
    }
    return { startDate: startDate.toISOString(), endDate: new Date().toISOString() };
  }

  private rangeToMonths(range: string): number {
    switch (range) {
      case '7d': return 1;
      case '30d': return 3;
      case '6m': return 6;
      case '1y': return 12;
      default: return 6;
    }
  }

  private loadData(range?: string): void {
    this.state.set('loading');
    const currentRange = range ?? this.selectedRange();
    const dateRange = currentRange ? this.computeDateRange(currentRange) : null;
    const months = this.rangeToMonths(currentRange);

    forkJoin({
      summary: this.financeService.getSummary().pipe(catchError(() => of(null))),
      chart: this.financeService.getMonthlyChart(months).pipe(catchError(() => of(null))),
      transactions: this.financeService.getTransactions({
        limit: 5,
        sortBy: 'date',
        sortDir: 'desc',
        ...(dateRange ? { startDate: dateRange.startDate, endDate: dateRange.endDate } : {}),
      }).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ summary, chart, transactions }) => {
        if (!summary && !chart && !transactions) {
          this.state.set('error');
          this.toast.error(this.i18n.translate('common.toasts.dashboard_load_failed'));
          return;
        }

        const hasValidSummary = summary && typeof summary.totalIncome === 'number';
        this.stats.set(hasValidSummary
          ? this.mapSummary(summary)
          : this.mapSummary({ totalBalance: 0, totalIncome: 0, totalExpenses: 0, savingsRate: 0 }));

        if (chart && chart.length > 0) {
          const colors = this.chartColors.get();
          this.chartLabels.set(chart.map(d => d.month));
          this.chartDatasets.set([
            { label: this.i18n.translate('transactions.form.income'), data: chart.map(d => d.income), color: colors.income },
            { label: this.i18n.translate('transactions.form.expense'), data: chart.map(d => Math.abs(d.expenses)), color: colors.expense },
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
      { id: 'balance', label: 'home.totalBalance', value: summary.totalBalance, icon: 'wallet', insight: summary.totalBalance > 0 ? 'home.positiveBalance' : 'home.noBalance' },
      { id: 'income', label: 'home.monthlyIncome', value: summary.totalIncome, icon: 'income', sign: '+' },
      { id: 'expenses', label: 'home.monthlyExpenses', value: summary.totalExpenses, icon: 'expense', sign: '-' },
      { id: 'savings', label: 'home.savingsRate', value: summary.savingsRate, suffix: '%', icon: 'subscription', insight: summary.savingsRate > 20 ? 'home.onTrack' : summary.savingsRate > 0 ? 'home.couldImprove' : undefined },
    ];
  }

  retry(): void {
    this.loadData(this.selectedRange());
  }

  setRange(range: string): void {
    this.selectedRange.set(range);
    this.loadData(range);
  }
}