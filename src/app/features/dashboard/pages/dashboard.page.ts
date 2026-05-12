import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsGridComponent } from '../components/stats-grid/stats-grid.component';
import { ChartPlaceholderComponent } from '../components/chart-placeholder/chart-placeholder.component';
import { RecentActivityComponent, ActivityItem } from '../components/recent-activity/recent-activity.component';
import { StatCardData } from '../components/stat-card/stat-card.types';

// Demo data — will be replaced by service calls
const DEMO_STATS: StatCardData[] = [
  { id: 'balance', label: 'Total Balance', value: 12450.80, icon: '💰', trend: 8.2, insight: 'Above last month' },
  { id: 'income', label: 'Monthly Income', value: 4200.00, icon: '📈', trend: 3.1 },
  { id: 'expenses', label: 'Monthly Expenses', value: 2840.50, icon: '📉', trend: -5.4 },
  { id: 'savings', label: 'Savings Rate', value: 32.4, suffix: '%', icon: '🎯', trend: 2.8, insight: 'On track' },
];

const DEMO_ACTIVITY: ActivityItem[] = [
  { id: '1', description: 'Salary deposit', category: 'Income', amount: 4200, type: 'income', date: '2026-05-10', icon: '💳' },
  { id: '2', description: 'Grocery store', category: 'Food', amount: 85.40, type: 'expense', date: '2026-05-09', icon: '🛒' },
  { id: '3', description: 'Netflix subscription', category: 'Entertainment', amount: 15.99, type: 'expense', date: '2026-05-08', icon: '🎬' },
  { id: '4', description: 'Freelance payment', category: 'Freelance', amount: 650, type: 'income', date: '2026-05-07', icon: '💻' },
  { id: '5', description: 'Gas station', category: 'Transport', amount: 45.00, type: 'expense', date: '2026-05-06', icon: '⛽' },
];

@Component({
  selector: 'ft-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, StatsGridComponent, ChartPlaceholderComponent, RecentActivityComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  readonly stats = signal<StatCardData[]>(DEMO_STATS);
  readonly activity = signal<ActivityItem[]>(DEMO_ACTIVITY);
  readonly loading = signal(false);
}
