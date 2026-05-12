import { Component, input, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UiBadgeComponent } from '../../../../shared/ui/ui-badge/ui-badge.component';

export interface ActivityItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  icon?: string;
}

@Component({
  selector: 'ft-recent-activity',
  standalone: true,
  imports: [CommonModule, DatePipe, UiBadgeComponent],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.scss',
})
export class RecentActivityComponent {
  items = input.required<ActivityItem[]>();
  loading = input<boolean>(false);
  maxItems = input<number>(5);

  readonly visibleItems = computed<ActivityItem[]>(() =>
    this.items().slice(0, this.maxItems())
  );

  readonly isEmpty = computed<boolean>(() =>
    !this.loading() && this.items().length === 0
  );

  formatAmount(item: ActivityItem): string {
    const sign = item.type === 'income' ? '+' : '-';
    return `${sign}$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  amountClass(item: ActivityItem): string {
    return item.type === 'income' ? 'amount--income' : 'amount--expense';
  }
}
