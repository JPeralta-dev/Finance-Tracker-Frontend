import { Component, input, computed, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { UiBadgeComponent } from '../../../../shared/ui/ui-badge/ui-badge.component';
import { getCategoryIcon } from '../../../../shared/icons/icon-registry';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CategoryTranslatePipe } from '../../../../core/pipes/category-translate.pipe';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ChannelBadgeComponent, ChannelOrigin } from '../../../../shared/ui/channel-badge/channel-badge.component';

export interface ActivityItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  bankName?: string;
  origin?: ChannelOrigin;
}

interface ActivityGroup {
  labelKey: string;
  items: ActivityItem[];
}

@Component({
  selector: 'ft-recent-activity',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, UiBadgeComponent, NgIcon, TranslatePipe, CategoryTranslatePipe, ChannelBadgeComponent],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.scss',
})
export class RecentActivityComponent {
  private currencyService = inject(CurrencyService);

  items = input.required<ActivityItem[]>();
  loading = input<boolean>(false);
  pageSize = input<number>(8);

  /** Number of items currently shown */
  readonly visibleCount = signal<number>(5);

  readonly isEmpty = computed<boolean>(() =>
    !this.loading() && this.items().length === 0
  );

  readonly hasMore = computed<boolean>(() =>
    this.visibleCount() < this.items().length
  );

  /** Group items by date: Today, Yesterday, This Week, Earlier.
   *  Uses UTC methods to avoid timezone mismatches between server and client. */
  readonly groups = computed<ActivityGroup[]>(() => {
    const visible = this.items().slice(0, this.visibleCount());
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups = new Map<string, ActivityItem[]>();

    for (const item of visible) {
      const itemDate = new Date(item.date);
      const itemDay = new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate()));

      let key: string;
      if (itemDay.getTime() === today.getTime()) {
        key = 'dashboard.activity.today';
      } else if (itemDay.getTime() === yesterday.getTime()) {
        key = 'dashboard.activity.yesterday';
      } else if (itemDay.getTime() >= weekAgo.getTime()) {
        key = 'dashboard.activity.thisWeek';
      } else {
        key = 'dashboard.activity.earlier';
      }

      const existing = groups.get(key) ?? [];
      existing.push(item);
      groups.set(key, existing);
    }

    const order = ['dashboard.activity.today', 'dashboard.activity.yesterday', 'dashboard.activity.thisWeek', 'dashboard.activity.earlier'];
    return order
      .filter(key => groups.has(key))
      .map(key => ({ labelKey: key, items: groups.get(key)! }));
  });

  loadMore(): void {
    this.visibleCount.update(c => Math.min(c + this.pageSize(), this.items().length));
  }

  getItemIcon(category: string): string {
    return getCategoryIcon(category);
  }

  formatAmount(item: ActivityItem): string {
    const sign = item.type === 'income' ? '+' : '-';
    return `${sign}${this.currencyService.format(item.amount)}`;
  }

  amountClass(item: ActivityItem): string {
    return item.type === 'income' ? 'amount--income' : 'amount--expense';
  }
}
