import { Component, input, output, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { UiBadgeComponent } from '../../../../shared/ui/ui-badge/ui-badge.component';
import { TransactionRowData } from '../../transaction.types';
import { getCategoryMeta } from '../../components/transaction.utils';

@Component({
  selector: 'ft-transaction-row',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, UiBadgeComponent],
  templateUrl: './transaction-row.component.html',
  styleUrl: './transaction-row.component.scss',
})
export class TransactionRowComponent {
  data = input.required<TransactionRowData>();
  compact = input<boolean>(false);

  ftClick = output<string>();

  onClick(): void {
    this.ftClick.emit(this.data().id);
  }

  readonly categoryMeta = computed(() => getCategoryMeta(this.data().category));

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
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
