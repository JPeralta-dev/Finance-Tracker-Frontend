import { Component, input, output, model, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { AnalyticsStore } from '../../services/analytics.store';

@Component({
  selector: 'ft-analytics-filters',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  templateUrl: './analytics-filters.component.html',
  styleUrl: './analytics-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsFiltersComponent {
  private readonly store = inject(AnalyticsStore);

  open = model(false);
  categories = input<string[]>([]);
  selectedCategory = model<string | null>(null);
  selectedType = model<'all' | 'income' | 'expense'>('all');
  typeChange = output<'all' | 'income' | 'expense'>();
  categoryChange = output<string | null>();
  reset = output<void>();

  toggle(): void {
    this.open.update(v => !v);
  }

  selectType(type: 'all' | 'income' | 'expense'): void {
    this.selectedType.set(type);
    this.typeChange.emit(type);
    this.store.setType(type);
  }

  selectCategory(cat: string | null): void {
    this.selectedCategory.set(cat);
    this.categoryChange.emit(cat);
    this.store.setCategory(cat);
  }

  onReset(): void {
    this.selectedType.set('all');
    this.selectedCategory.set(null);
    this.reset.emit();
    this.store.clearFilters();
  }
}
