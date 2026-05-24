import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { catchError, forkJoin, of } from 'rxjs';

import { AreaChartComponent, AreaDataset } from '../../../shared/charts';
import { DonutChartComponent, DonutData } from '../../../shared/charts';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FinanceService } from '../../../core/services/finance.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ToastService } from '../../../core/services/toast.service';
import { ICONS } from '../../../shared/icons/icon-registry';
import type { ChartData } from '../../../core/models/chart.model';
import type { Category } from '../../../core/models/category.model';

// MOCK DATA — Remove when backend has real data
const MOCK_MONTHLY_DATA = [
  { month: 'Nov', income: 1850000, expenses: 450000 },
  { month: 'Dec', income: 1920000, expenses: 680000 },
  { month: 'Ene', income: 1780000, expenses: 520000 },
  { month: 'Feb', income: 2100000, expenses: 590000 },
  { month: 'Mar', income: 1950000, expenses: 480000 },
  { month: 'Abr', income: 1856000, expenses: 2000 },
];

const MOCK_CATEGORIES = [
  { name: 'Comida', total: 450000, kind: 'expense' as const, color: '#9D50BB' },
  { name: 'Servicios', total: 180000, kind: 'expense' as const, color: '#7B42F6' },
  { name: 'Transporte', total: 120000, kind: 'expense' as const, color: '#6E48AA' },
  { name: 'Entretenimiento', total: 85000, kind: 'expense' as const, color: '#A78BFA' },
];

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
        const colors = getChartColors();

        // Monthly chart data — use mock if API returns empty
        if (chart && chart.length > 0) {
          const mapped = mapMonthlyChartData(chart, colors);
          this.monthlyLabels.set(mapped.labels);
          this.monthlyDatasets.set(mapped.datasets);
        } else {
          // Fallback to mock data
          const mapped = mapMonthlyChartData(MOCK_MONTHLY_DATA, colors);
          this.monthlyLabels.set(mapped.labels);
          this.monthlyDatasets.set(mapped.datasets);
        }

        // Category donut data — use mock if API returns empty
        if (categories && categories.length > 0) {
          this.donutData.set(mapCategoryToDonut(categories, colors.categories));
        } else {
          // Fallback to mock data
          this.donutData.set(mapCategoryToDonut(MOCK_CATEGORIES as Category[], colors.categories));
        }

        // Summary
        if (summary) {
          this.totalIncome.set(summary.totalIncome);
          this.totalExpense.set(summary.totalExpenses);
        } else {
          // Fallback to mock summary
          const totalIncome = MOCK_MONTHLY_DATA.reduce((sum, m) => sum + m.income, 0);
          const totalExpense = MOCK_MONTHLY_DATA.reduce((sum, m) => sum + m.expenses, 0);
          this.totalIncome.set(totalIncome);
          this.totalExpense.set(totalExpense);
        }

        // Always show ready state when we have mock data
        this.state.set('ready');
      },
      error: () => {
        // Even on error, show mock data
        const colors = getChartColors();
        const mapped = mapMonthlyChartData(MOCK_MONTHLY_DATA, colors);
        this.monthlyLabels.set(mapped.labels);
        this.monthlyDatasets.set(mapped.datasets);
        this.donutData.set(mapCategoryToDonut(MOCK_CATEGORIES as Category[], colors.categories));
        
        const totalIncome = MOCK_MONTHLY_DATA.reduce((sum, m) => sum + m.income, 0);
        const totalExpense = MOCK_MONTHLY_DATA.reduce((sum, m) => sum + m.expenses, 0);
        this.totalIncome.set(totalIncome);
        this.totalExpense.set(totalExpense);
        
        this.state.set('ready');
      },
    });
  }
}
