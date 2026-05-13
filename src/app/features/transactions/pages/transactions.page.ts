import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionTableComponent } from '../components/transaction-table/transaction-table.component';
import { TransactionRowData } from '../transaction.types';

// Demo data — will be replaced by service calls
const DEMO_TRANSACTIONS: TransactionRowData[] = [
  { id: '1', description: 'Salary deposit', category: 'Salary', amount: 4200, type: 'income', date: '2026-05-10' },
  { id: '2', description: 'Grocery store', category: 'Food', amount: 85.40, type: 'expense', date: '2026-05-09' },
  { id: '3', description: 'Netflix subscription', category: 'Subscription', amount: 15.99, type: 'expense', date: '2026-05-08' },
  { id: '4', description: 'Freelance payment', category: 'Freelance', amount: 650, type: 'income', date: '2026-05-07' },
  { id: '5', description: 'Gas station', category: 'Transport', amount: 45.00, type: 'expense', date: '2026-05-06' },
  { id: '6', description: 'Restaurant dinner', category: 'Food', amount: 62.30, type: 'expense', date: '2026-05-05' },
  { id: '7', description: 'Uber ride', category: 'Transport', amount: 12.50, type: 'expense', date: '2026-05-04' },
  { id: '8', description: 'Amazon purchase', category: 'Shopping', amount: 129.99, type: 'expense', date: '2026-05-03' },
  { id: '9', description: 'Gym membership', category: 'Health', amount: 39.99, type: 'expense', date: '2026-05-02' },
  { id: '10', description: 'Electric bill', category: 'Utilities', amount: 85.00, type: 'expense', date: '2026-05-01' },
  { id: '11', description: 'Coffee shop', category: 'Food', amount: 5.50, type: 'expense', date: '2026-04-30' },
  { id: '12', description: 'Rent payment', category: 'Rent', amount: 1200, type: 'expense', date: '2026-04-28' },
  { id: '13', description: 'Concert tickets', category: 'Entertainment', amount: 75.00, type: 'expense', date: '2026-04-25' },
  { id: '14', description: 'Bonus payment', category: 'Salary', amount: 500, type: 'income', date: '2026-04-22' },
  { id: '15', description: 'Pharmacy', category: 'Health', amount: 22.80, type: 'expense', date: '2026-04-20' },
];

@Component({
  selector: 'ft-transactions-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TransactionTableComponent],
  templateUrl: './transactions.page.html',
  styleUrl: './transactions.page.scss',
})
export class TransactionsPage {
  readonly transactions = signal<TransactionRowData[]>(DEMO_TRANSACTIONS);
  readonly loading = signal(false);

  onSelect(id: string): void {
    console.log('Selected transaction:', id);
  }
}
