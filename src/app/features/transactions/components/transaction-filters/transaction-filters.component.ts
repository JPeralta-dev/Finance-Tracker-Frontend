import { Component, input, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { TransactionFilter, SortField, SortDirection } from '../../transaction.types';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-transaction-filters',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  templateUrl: './transaction-filters.component.html',
  styleUrl: './transaction-filters.component.scss',
})
export class TransactionFiltersComponent implements OnDestroy {
  activeFilter = input<TransactionFilter>('all');
  activeSort = input<SortField>('date');
  activeDirection = input<SortDirection>('desc');

  filterChange = output<TransactionFilter>();
  sortChange = output<{ field: SortField; direction: SortDirection }>();
  searchChange = output<string>();

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  onFilterChange(filter: TransactionFilter): void {
    this.filterChange.emit(filter);
  }

  onSortChange(field: SortField): void {
    const newDirection = this.activeSort() === field && this.activeDirection() === 'desc'
      ? 'asc'
      : 'desc';
    this.sortChange.emit({ field, direction: newDirection });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.searchChange.emit(value);
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}
