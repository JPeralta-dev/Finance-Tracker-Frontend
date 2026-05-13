import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { StatsGridComponent } from '../components/stats-grid/stats-grid.component';
import { AreaChartComponent, AreaDataset } from '../../../shared/charts';
import { RecentActivityComponent, ActivityItem } from '../components/recent-activity/recent-activity.component';
import { StatCardData } from '../components/stat-card/stat-card.types';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';
import { HoverDepthDirective } from '../../../shared/directives/hover-depth.directive';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

type DashboardState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatsGridComponent,
    AreaChartComponent,
    RecentActivityComponent,
    ScrollRevealDirective,
    HoverDepthDirective,
    CountUpDirective,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);

  readonly stats = signal<StatCardData[]>([]);
  readonly activity = signal<ActivityItem[]>([]);
  readonly state = signal<DashboardState>('loading');

  // Chart data
  readonly chartLabels = signal<string[]>([]);
  readonly chartDatasets = signal<AreaDataset[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.state.set('loading');

    forkJoin({
      summary: this.financeService.getSummary().pipe(catchError(() => of(null))),
      chart: this.financeService.getMonthlyChart().pipe(catchError(() => of(null))),
      transactions: this.financeService.getTransactions({ limit: 5, sortBy: 'date', sortDir: 'desc' }).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ summary, chart, transactions }) => {
        if (!summary && !chart && !transactions) {
          this.state.set('error');
          this.toast.error('Failed to load dashboard data. Please try again.');
          return;
        }

        if (summary) {
          this.stats.set(this.mapSummary(summary));
        }

        if (chart) {
          this.chartLabels.set(chart.map(d => d.month));
          this.chartDatasets.set([
            { label: 'Income', data: chart.map(d => d.income), color: '#06D6A0' },
            { label: 'Expenses', data: chart.map(d => d.expenses), color: '#FF6B6B' },
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
      { id: 'balance', label: 'Total Balance', value: summary.totalBalance, icon: 'wallet', insight: summary.totalBalance > 0 ? 'Positive balance' : 'No balance' },
      { id: 'income', label: 'Monthly Income', value: summary.totalIncome, icon: 'income' },
      { id: 'expenses', label: 'Monthly Expenses', value: summary.totalExpenses, icon: 'expense' },
      { id: 'savings', label: 'Savings Rate', value: summary.savingsRate, suffix: '%', icon: 'subscription', insight: summary.savingsRate > 20 ? 'On track' : summary.savingsRate > 0 ? 'Could improve' : undefined },
    ];
  }

  retry(): void {
    this.loadData();
  }
}
