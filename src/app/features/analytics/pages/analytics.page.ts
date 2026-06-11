import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { catchError, forkJoin, of } from 'rxjs';

import { AreaChartComponent, AreaDataset } from '../../../shared/charts';
import { DonutChartComponent, DonutData } from '../../../shared/charts';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
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

export function mapCategoryToDonut(categories: Category[], colors: string[], i18n?: TranslationService): DonutData {
  const expenseCats = categories
    .filter(c => c.kind === 'expense' || c.kind === 'mixed')
    .filter(c => c.total > 0);

  return {
    labels: expenseCats.map(c => i18n ? i18n.translate(c.name) : c.name),
    data: expenseCats.map(c => c.total),
    colors: expenseCats.map((_, i) => colors[i % colors.length]),
  };
}

export function mapMonthlyChartData(
  chartData: ChartData[],
  colors: ChartColors,
  i18n?: TranslationService,
): { labels: string[]; datasets: AreaDataset[] } {
  return {
    labels: chartData.map(d => d.month),
    datasets: [
      { label: i18n ? i18n.translate('transactions.form.income') : 'Income', data: chartData.map(d => d.income), color: colors.income },
      { label: i18n ? i18n.translate('transactions.form.expense') : 'Expenses', data: chartData.map(d => d.expenses), color: colors.expense },
    ],
  };
}

@Component({
  selector: 'ft-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    RouterLink,
    AreaChartComponent,
    DonutChartComponent,
    FtSubtleRevealDirective,
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
  private readonly i18n = inject(TranslationService);

  readonly state = signal<AnalyticsState>('loading');

  // Chart data
  readonly monthlyLabels = signal<string[]>([]);
  readonly monthlyDatasets = signal<AreaDataset[]>([]);
  readonly donutData = signal<DonutData>({ labels: [], data: [], colors: [] });

  // Summary data
  readonly totalIncome = signal<number>(0);
  readonly totalExpense = signal<number>(0);
  readonly netSavings = computed(() => calculateNetSavings(this.totalIncome(), this.totalExpense()));

  // Date range selector
  readonly selectedRange = signal<string>('6m');
  readonly dateRanges = [
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
  ];

  readonly selectedRangeLabel = computed(() => {
    const r = this.dateRanges.find(d => d.value === this.selectedRange());
    return r ? `Last ${r.label}` : 'Last 6 months';
  });

  // Comparison vs previous period
  readonly incomeChange = signal<number | null>(null);
  readonly expenseChange = signal<number | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  formatAmount(value: number): string {
    return this.currencyService.format(value);
  }

  retry(): void {
    this.loadData();
  }

  setRange(range: string): void {
    this.selectedRange.set(range);
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
        const colors = getChartColors();
        let hasData = false;

        // Monthly chart data
        if (chart && chart.length > 0) {
          const mapped = mapMonthlyChartData(chart, colors, this.i18n);
          this.monthlyLabels.set(mapped.labels);
          this.monthlyDatasets.set(mapped.datasets);
          hasData = true;
        }

        // Category donut data
        if (categories && categories.length > 0) {
          this.donutData.set(mapCategoryToDonut(categories, colors.categories, this.i18n));
          hasData = true;
        }

        // Summary
        if (summary) {
          this.totalIncome.set(summary.totalIncome);
          this.totalExpense.set(summary.totalExpenses);
          hasData = true;
        }

        this.state.set(hasData ? 'ready' : 'empty');
      },
      error: () => {
        this.state.set('error');
        this.toast.error(this.i18n.translate('analytics.errorDesc'));
      },
    });
  }
}
