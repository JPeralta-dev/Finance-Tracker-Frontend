import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsGridComponent } from '../components/stats-grid/stats-grid.component';
import { AreaChartComponent, AreaDataset } from '../../../shared/charts';
import { RecentActivityComponent, ActivityItem } from '../components/recent-activity/recent-activity.component';
import { StatCardData } from '../components/stat-card/stat-card.types';
import { ScrollRevealDirective } from '../../../shared/directives/scroll-reveal.directive';
import { HoverDepthDirective } from '../../../shared/directives/hover-depth.directive';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';

// Demo data — will be replaced by service calls
const DEMO_STATS: StatCardData[] = [
  { id: 'balance', label: 'Total Balance', value: 12450.80, icon: 'wallet', trend: 8.2, insight: 'Above last month' },
  { id: 'income', label: 'Monthly Income', value: 4200.00, icon: 'income', trend: 3.1 },
  { id: 'expenses', label: 'Monthly Expenses', value: 2840.50, icon: 'expense', trend: -5.4 },
  { id: 'savings', label: 'Savings Rate', value: 32.4, suffix: '%', icon: 'subscription', trend: 2.8, insight: 'On track' },
];

const DEMO_ACTIVITY: ActivityItem[] = [
  { id: '1', description: 'Salary deposit', category: 'Income', amount: 4200, type: 'income', date: '2026-05-10' },
  { id: '2', description: 'Grocery store', category: 'Food', amount: 85.40, type: 'expense', date: '2026-05-09' },
  { id: '3', description: 'Netflix subscription', category: 'Subscription', amount: 15.99, type: 'expense', date: '2026-05-08' },
  { id: '4', description: 'Freelance payment', category: 'Freelance', amount: 650, type: 'income', date: '2026-05-07' },
  { id: '5', description: 'Gas station', category: 'Transport', amount: 45.00, type: 'expense', date: '2026-05-06' },
];

const CHART_LABELS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

const CHART_DATASETS: AreaDataset[] = [
  { label: 'Income', data: [3800, 4100, 3900, 4200, 4000, 4200], color: '#06D6A0' },
  { label: 'Expenses', data: [2600, 2900, 3100, 2800, 3000, 2840], color: '#FF6B6B' },
];

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
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  readonly stats = signal<StatCardData[]>(DEMO_STATS);
  readonly activity = signal<ActivityItem[]>(DEMO_ACTIVITY);
  readonly loading = signal(false);

  // Chart data
  readonly chartLabels = CHART_LABELS;
  readonly chartDatasets = CHART_DATASETS;
}
