import { Component, signal, inject, OnInit, computed, Injectable, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';

import { StatsGridComponent } from '../components/stats-grid/stats-grid.component';
import { FtEChartComponent, EchartsThemeMapper } from '../../../shared/charts';
import { RecentActivityComponent, ActivityItem } from '../components/recent-activity/recent-activity.component';
import { StatCardData } from '../components/stat-card/stat-card.types';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { HoverDepthDirective } from '../../../shared/directives/hover-depth.directive';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { AuthService } from '../../../core/services/auth.service';
import { DateRangeService } from '../../../core/services/date-range.service';
import { AiInsightsCardComponent } from '../components/ai-insights-card/ai-insights-card.component';
import { GoalsWidgetComponent } from '../components/goals-widget/goals-widget.component';
import { PocketProgressWidget } from '../widgets/pocket-progress.widget';
import { IconComponent } from '../../../shared/icons/icon.component';
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
    ClickOutsideDirective,
    EmptyStateComponent,
    TranslatePipe,
    AiInsightsCardComponent,
    GoalsWidgetComponent,
    PocketProgressWidget,
    IconComponent,
    NgIcon,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);
  readonly i18n = inject(TranslationService);
  private readonly themeMapper = inject(EchartsThemeMapper);
  private readonly chartColors = inject(ChartColorCache);
  readonly authService = inject(AuthService);
  readonly dateRange = inject(DateRangeService);

  readonly stats = signal<StatCardData[]>([]);
  readonly activity = signal<ActivityItem[]>([]);
  readonly state = signal<DashboardState>('loading');
  readonly monthOpen = signal(false);

  readonly chartLabels = signal<string[]>([]);
  readonly chartDatasets = signal<AreaDataset[]>([]);

  readonly chartMonths = computed(() => {
    const start = this.dateRange.startDate();
    if (!start) return 6;
    const today = new Date();
    const startDate = new Date(start + 'T12:00:00');
    const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth()) + 1;
    return Math.max(6, monthsDiff);
  });

  readonly areaChartOptions = computed<EChartsOption | undefined>(() => {
    const labels = this.chartLabels();
    const datasets = this.chartDatasets();
    if (labels.length === 0 || datasets.length === 0) return undefined;
    return this.themeMapper.buildAreaOption(labels, datasets);
  });

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'dashboard.greeting_morning';
    if (hour < 18) return 'dashboard.greeting_afternoon';
    return 'dashboard.greeting_evening';
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
    this.loadData();
  }

  private loadData(): void {
    this.state.set('loading');
    const dateParams = this.dateRange.getApiParams();

    forkJoin({
      summary: this.financeService.getSummary(dateParams).pipe(catchError(() => of(null))),
      chart: this.financeService.getMonthlyChart(this.chartMonths()).pipe(catchError(() => of(null))),
      transactions: this.financeService.getTransactions({
        limit: 10,
        sortBy: 'date',
        sortDir: 'desc',
        ...this.dateRange.getFilters(),
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
            bankName: t.bank?.name,
            origin: (t as any).origin,
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

  onMonthSelect(month: { start: string; end: string }): void {
    this.dateRange.setMonth(month.start, month.end);
    this.monthOpen.set(false);
    this.loadData();
  }

  toggleMonthDropdown(): void {
    this.monthOpen.update(v => !v);
  }

  private mapSummary(summary: { totalBalance: number; totalIncome: number; totalExpenses: number; savingsRate: number }): StatCardData[] {
    return [
      { id: 'balance', label: 'dashboard.totalBalance', value: summary.totalBalance, icon: 'wallet', insight: summary.totalBalance > 0 ? 'dashboard.positiveBalance' : 'dashboard.noBalance' },
      { id: 'income', label: 'dashboard.monthlyIncome', value: summary.totalIncome, icon: 'income', sign: '+' },
      { id: 'expenses', label: 'dashboard.monthlyExpenses', value: summary.totalExpenses, icon: 'expense', sign: '-' },
      { id: 'savings', label: 'dashboard.savingsRate', value: summary.savingsRate, suffix: '%', icon: 'subscription', insight: summary.savingsRate > 20 ? 'dashboard.onTrack' : summary.savingsRate > 0 ? 'dashboard.couldImprove' : undefined },
    ];
  }

  retry(): void {
    this.loadData();
  }
}