import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { UiBadgeComponent } from '../../../../shared/ui/ui-badge/ui-badge.component';
import { TransactionRowData } from '../../transaction.types';
import { getCategoryMeta, getCategoryIcon } from '../../components/transaction.utils';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { CurrencyService } from '../../../../core/services/currency.service';
import { CategoryTranslatePipe } from '../../../../core/pipes/category-translate.pipe';

@Component({
  selector: 'ft-transaction-row',
  standalone: true,
  imports: [CommonModule, UiBadgeComponent, NgIcon, CategoryTranslatePipe],
  templateUrl: './transaction-row.component.html',
  styleUrl: './transaction-row.component.scss',
})
export class TransactionRowComponent {
  private currencyService = inject(CurrencyService);

  data = input.required<TransactionRowData>();
  compact = input<boolean>(false);
  selectable = input<boolean>(false);
  selected = input<boolean>(false);

  ftClick = output<string>();
  ftToggleSelect = output<string>();

  onClick(): void {
    if (this.selectable()) {
      this.ftToggleSelect.emit(this.data().id);
    } else {
      this.ftClick.emit(this.data().id);
    }
  }

  readonly categoryMeta = computed(() => getCategoryMeta(this.data().category));
  readonly categoryIcon = computed(() => getCategoryIcon(this.data().category));

  readonly amountSign = computed(() =>
    this.data().type === 'income' ? '+' : '-'
  );

  readonly amountClass = computed(() =>
    this.data().type === 'income' ? 'amount--income' : 'amount--expense'
  );

  /**
   * Formats an ISO date string for display.
   *
   * Uses noon UTC to avoid timezone shift: new Date('2026-07-01') is midnight UTC,
   * which toLocaleDateString converts to June 30 in UTC-5 or earlier locales.
   * Appending T12:00:00 keeps the date in the correct calendar day everywhere.
   */
  formatDate(dateStr: string): string {
    // Build a noon-UTC ISO string from the date portion to avoid timezone rollback.
    const noonUTC = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00.000Z`;
    const date = new Date(noonUTC);
    return date.toLocaleDateString(this.currencyService.currencyConfig().locale, { month: 'short', day: 'numeric' });
  }

  formatAmount(amount: number): string {
    return this.currencyService.format(amount);
  }
}
