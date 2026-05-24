import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { UiBadgeComponent } from '../../../../shared/ui/ui-badge/ui-badge.component';
import { TransactionRowData } from '../../transaction.types';
import { getCategoryMeta, getCategoryIcon } from '../../components/transaction.utils';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'ft-transaction-row',
  standalone: true,
  imports: [CommonModule, UiBadgeComponent, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './transaction-row.component.html',
  styleUrl: './transaction-row.component.scss',
})
export class TransactionRowComponent {
  private currencyService = inject(CurrencyService);

  data = input.required<TransactionRowData>();
  compact = input<boolean>(false);

  ftClick = output<string>();

  onClick(): void {
    this.ftClick.emit(this.data().id);
  }

  readonly categoryMeta = computed(() => getCategoryMeta(this.data().category));
  readonly categoryIcon = computed(() => getCategoryIcon(this.data().category));

  readonly amountSign = computed(() =>
    this.data().type === 'income' ? '+' : '-'
  );

  readonly amountClass = computed(() =>
    this.data().type === 'income' ? 'amount--income' : 'amount--expense'
  );

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatAmount(amount: number): string {
    return this.currencyService.format(amount);
  }
}
