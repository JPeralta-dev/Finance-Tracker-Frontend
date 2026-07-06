import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';

import { TransactionTableComponent } from '../components/transaction-table/transaction-table.component';
import { TransactionRowData } from '../transaction.types';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { DateRangeService } from '../../../core/services/date-range.service';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';

type TransactionsState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-transactions-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TransactionTableComponent, EmptyStateComponent, TranslatePipe, FormsModule, NgIcon, ClickOutsideDirective],
  templateUrl: './transactions.page.html',
  styleUrl: './transactions.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  readonly dateRange = inject(DateRangeService);

  readonly transactions = signal<TransactionRowData[]>([]);
  readonly state = signal<TransactionsState>('loading');

  readonly monthOpen = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.state.set('loading');

    const filters: any = { sortBy: 'date', sortDir: 'desc', ...this.dateRange.getFilters() };

    this.financeService.getTransactions(filters)
      .pipe(catchError(() => {
        this.state.set('error');
        this.toast.error(this.i18n.translate('common.toasts.transactions_load_failed'));
        return of([]);
      }))
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.state.set('empty');
            this.transactions.set([]);
            return;
          }

          this.transactions.set(data.map(t => ({
            id: t.id,
            description: t.description,
            category: t.category,
            amount: t.amount,
            type: t.type,
            date: t.date,
            bankName: t.bank?.name,
            bankLogoUrl: t.bank?.logoUrl,
          })));
          this.state.set('ready');
        },
      });
  }

  onMonthSelect(month: { start: string; end: string }): void {
    this.dateRange.setMonth(month.start, month.end);
    this.monthOpen.set(false);
    this.loadData();
  }

  toggleMonthDropdown(): void {
    this.monthOpen.update(v => !v);
  }

  onSelect(id: string): void {
    this.router.navigate(['/transactions', id]);
  }

  onBulkDelete(ids: string[]): void {
    forkJoin(ids.map(id => this.financeService.deleteTransaction(id).pipe(catchError(() => of(null)))))
      .subscribe(() => {
        this.loadData();
        this.toast.success(`${ids.length} transaction${ids.length > 1 ? 's' : ''} deleted`);
      });
  }

  retry(): void {
    this.loadData();
  }
}
