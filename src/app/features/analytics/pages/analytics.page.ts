import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { catchError, forkJoin, of } from 'rxjs';

import { AreaChartComponent, AreaDataset } from '../../../shared/charts';
import { DonutChartComponent, DonutData } from '../../../shared/charts';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FinanceService } from '../../../core/services/finance.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';
import { ICONS } from '../../../shared/icons/icon-registry';
import type { ChartData } from '../../../core/models/chart.model';
import type { Category } from '../../../core/models/category.model';

type AnalyticsState = 'loading' | 'ready' | 'empty' | 'error';

// ── Pure functions (exported for testing) ──────────────────────────────

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

export function calculateNetSavings(income: number, expense: number): number {
  return income - expense;
}

export function mapCategoryToDonut(categories: Category[], colors: string[]): DonutData {
  const expenseCats = categories
    .filter(c => c.kind === 'expense' || c.kind === 'mixed')
    .filter(c => c.total > 0);

  return {
    labels: expenseCats.map(c => c.name),
    data: expenseCats.map(c => c.total),
    colors: expenseCats.map((_, i) => colors[i % colors.length]),
  };
}

export function mapMonthlyChartData(
  chartData: ChartData[],
  colors: ChartColors,
): { labels: string[]; datasets: AreaDataset[] } {
  return {
    labels: chartData.map(d => d.month),
    datasets: [
      { label: 'Income', data: chartData.map(d => d.income), color: colors.income },
      { label: 'Expenses', data: chartData.map(d => d.expenses), color: colors.expense },
    ],
  };
}

@Component({
  selector: 'ft-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    AreaChartComponent,
    DonutChartComponent,
    ScrollRevealDirective,
    EmptyStateComponent,
    TranslatePipe,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.scss',
})
export class AnalyticsPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly currencyService = inject(CurrencyService);
  private readonly toast = inject(ToastService);

  readonly state = signal<AnalyticsState>('loading');

  // Chart data
  readonly monthlyLabels = signal<string[]>([]);
  readonly monthlyDatasets = signal<AreaDataset[]>([]);
  readonly donutData = signal<DonutData>({ labels: [], data: [], colors: [] });

  // Summary data
  readonly totalIncome = signal<number>(0);
  readonly totalExpense = signal<number>(0);
  readonly netSavings = computed(() => calculateNetSavings(this.totalIncome(), this.totalExpense()));

  ngOnInit(): void {
    this.loadData();
  }

  formatAmount(value: number): string {
    return this.currencyService.format(value);
  }

  retry(): void {
    this.loadData();
  }

  private loadData(): void {
    this.state.set('loading');

    forkJoin({
      chart: this.financeService.getMonthlyChart().pipe(catchError(() => of(null))),
      categories: this.financeService.getCategories().pipe(catchError(() => of([]))),
      summary: this.financeService.getSummary().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ chart, categories, summary }) => {
        // If everything failed
        if (!chart && !summary && (!categories || categories.length === 0)) {
          this.state.set('error');
          this.toast.error('Failed to load analytics data. Please try again.');
          return;
        }

        const colors = getChartColors();

        // Monthly chart data
        if (chart && chart.length > 0) {
          const mapped = mapMonthlyChartData(chart, colors);
          this.monthlyLabels.set(mapped.labels);
          this.monthlyDatasets.set(mapped.datasets);
        }

        // Category donut data
        if (categories && categories.length > 0) {
          this.donutData.set(mapCategoryToDonut(categories, colors.categories));
        }

        // Summary
        if (summary) {
          this.totalIncome.set(summary.totalIncome);
          this.totalExpense.set(summary.totalExpenses);
        }

        // Check if user has any data
        const hasData = (summary?.totalIncome ?? 0) !== 0
          || (summary?.totalExpenses ?? 0) !== 0
          || (chart?.length ?? 0) > 0;

        this.state.set(hasData ? 'ready' : 'empty');
      },
      error: () => {
        this.state.set('error');
        this.toast.error('Failed to load analytics data.');
      },
    });
  }
}
