import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { TransactionTableComponent } from '../components/transaction-table/transaction-table.component';
import { TransactionRowData } from '../transaction.types';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

type TransactionsState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-transactions-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TransactionTableComponent, EmptyStateComponent, TranslatePipe],
  templateUrl: './transactions.page.html',
  styleUrl: './transactions.page.scss',
})
export class TransactionsPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  readonly transactions = signal<TransactionRowData[]>([]);
  readonly state = signal<TransactionsState>('loading');

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.state.set('loading');

    this.financeService.getTransactions({ sortBy: 'date', sortDir: 'desc' })
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
          })));
          this.state.set('ready');
        },
      });
  }

  onSelect(id: string): void {
    this.router.navigate(['/transactions', id]);
  }

  retry(): void {
    this.loadData();
  }
}
