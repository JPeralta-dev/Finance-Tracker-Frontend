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

export interface ActivityItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  bankName?: string;
  origin?: string;
}

interface ActivityGroup {
  label: string;
  items: ActivityItem[];
}

@Component({
  selector: 'ft-recent-activity',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, UiBadgeComponent, NgIcon, TranslatePipe, CategoryTranslatePipe],
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

  /** Group items by date: Today, Yesterday, This Week, Earlier */
  readonly groups = computed<ActivityGroup[]>(() => {
    const visible = this.items().slice(0, this.visibleCount());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups = new Map<string, ActivityItem[]>();

    for (const item of visible) {
      const itemDate = new Date(item.date);
      const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

      let label: string;
      if (itemDay.getTime() === today.getTime()) {
        label = 'Hoy';
      } else if (itemDay.getTime() === yesterday.getTime()) {
        label = 'Ayer';
      } else if (itemDay.getTime() >= weekAgo.getTime()) {
        label = 'Esta semana';
      } else {
        label = 'Anterior';
      }

      const existing = groups.get(label) ?? [];
      existing.push(item);
      groups.set(label, existing);
    }

    // Preserve order: Today, Yesterday, This Week, Earlier
    const order = ['Hoy', 'Ayer', 'Esta semana', 'Anterior'];
    return order
      .filter(label => groups.has(label))
      .map(label => ({ label, items: groups.get(label)! }));
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
