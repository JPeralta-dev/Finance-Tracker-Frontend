import { Component, input, model, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { ClickOutsideDirective } from '../../../../shared/directives/click-outside.directive';
import { AnalyticsStore } from '../../services/analytics.store';

@Component({
  selector: 'ft-analytics-filters',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, ClickOutsideDirective],
  templateUrl: './analytics-filters.component.html',
  styleUrl: './analytics-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsFiltersComponent {
  private readonly store = inject(AnalyticsStore);

  categories = input<string[]>([]);
  selectedType = model<'all' | 'income' | 'expense'>('all');
  selectedCategory = model<string | null>(null);

  readonly catOpen = signal(false);

  selectType(type: 'all' | 'income' | 'expense'): void {
    this.selectedType.set(type);
    this.store.setType(type);
  }

  selectCategory(cat: string | null): void {
    this.selectedCategory.set(cat);
    this.store.setCategory(cat);
  }
}
