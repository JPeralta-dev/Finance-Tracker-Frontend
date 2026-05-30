import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TransactionRowComponent } from '../transaction-row/transaction-row.component';
import { TransactionFiltersComponent } from '../transaction-filters/transaction-filters.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { TransactionRowData, TransactionFilter, SortField, SortDirection, SortConfig } from '../../transaction.types';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-transaction-table',
  standalone: true,
  imports: [CommonModule, NgIcon, TransactionRowComponent, TransactionFiltersComponent, PaginationComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.scss',
})
export class TransactionTableComponent {
  items = input.required<TransactionRowData[]>();
  loading = input<boolean>(false);
  pageSize = input<number>(10);
  compact = input<boolean>(false);

  ftSelect = output<string>();

  // Internal state
  private readonly _filter = signal<TransactionFilter>('all');
  private readonly _search = signal('');
  private readonly _sort = signal<SortConfig>({ field: 'date', direction: 'desc' });
  private readonly _page = signal(1);

  readonly filter = this._filter.asReadonly();
  readonly search = this._search.asReadonly();
  readonly sort = this._sort.asReadonly();
  readonly page = this._page.asReadonly();

  readonly filteredItems = computed<TransactionRowData[]>(() => {
    let result = [...this.items()];

    // Filter by type
    const f = this._filter();
    if (f !== 'all') {
      result = result.filter((item) => item.type === f);
    }

    // Filter by search
    const q = this._search().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q),
      );
    }

    // Sort
    const s = this._sort();
    result.sort((a, b) => {
      let cmp = 0;
      if (s.field === 'date') cmp = a.date.localeCompare(b.date);
      else if (s.field === 'amount') cmp = a.amount - b.amount;
      else if (s.field === 'category') cmp = a.category.localeCompare(b.category);
      return s.direction === 'desc' ? -cmp : cmp;
    });

    return result;
  });

  readonly totalFiltered = computed(() => this.filteredItems().length);

  readonly pagedItems = computed<TransactionRowData[]>(() => {
    const start = (this._page() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  readonly isEmpty = computed(() => !this.loading() && this.filteredItems().length === 0);

  readonly emptyMessage = computed(() => {
    const q = this._search();
    const f = this._filter();
    if (q) return `No results for "${q}"`;
    if (f !== 'all') return `No ${f} transactions found`;
    return 'No transactions yet';
  });

  onFilterChange(filter: TransactionFilter): void {
    this._filter.set(filter);
    this._page.set(1);
  }

  onSortChange(config: { field: SortField; direction: SortDirection }): void {
    this._sort.set(config);
    this._page.set(1);
  }

  onSearchChange(query: string): void {
    this._search.set(query);
    this._page.set(1);
  }

  onPageChange(page: number): void {
    this._page.set(page);
  }

  onSelect(id: string): void {
    this.ftSelect.emit(id);
  }
}
