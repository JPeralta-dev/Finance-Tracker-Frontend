import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionFilter, SortField, SortDirection } from '../../transaction.types';

@Component({
  selector: 'ft-transaction-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-filters.component.html',
  styleUrl: './transaction-filters.component.scss',
})
export class TransactionFiltersComponent {
  activeFilter = input<TransactionFilter>('all');
  activeSort = input<SortField>('date');
  activeDirection = input<SortDirection>('desc');

  filterChange = output<TransactionFilter>();
  sortChange = output<{ field: SortField; direction: SortDirection }>();
  searchChange = output<string>();

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
    this.searchChange.emit(value);
  }

  getSortIcon(field: SortField): string {
    if (this.activeSort() !== field) return '↕';
    return this.activeDirection() === 'desc' ? '↓' : '↑';
  }
}
