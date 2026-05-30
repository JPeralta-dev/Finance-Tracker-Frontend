import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { TransactionTableComponent } from '../components/transaction-table/transaction-table.component';
import { TransactionRowData } from '../transaction.types';
import { FinanceService } from '../../../core/services/finance.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';

type TransactionsState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-transactions-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TransactionTableComponent, EmptyStateComponent],
  templateUrl: './transactions.page.html',
  styleUrl: './transactions.page.scss',
})
export class TransactionsPage implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly toast = inject(ToastService);

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
        this.toast.error('Failed to load transactions. Please try again.');
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
    // Navigate to edit form — will be wired up when form component is updated
    console.log('Edit transaction:', id);
  }

  retry(): void {
    this.loadData();
  }
}
