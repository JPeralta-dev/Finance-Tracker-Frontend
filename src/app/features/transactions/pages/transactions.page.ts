import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionTableComponent } from '../components/transaction-table/transaction-table.component';
import { TransactionRowData } from '../transaction.types';

// Demo data — will be replaced by service calls
const DEMO_TRANSACTIONS: TransactionRowData[] = [
  { id: '1', description: 'Salary deposit', category: 'Salary', amount: 4200, type: 'income', date: '2026-05-10', icon: '💼' },
  { id: '2', description: 'Grocery store', category: 'Food', amount: 85.40, type: 'expense', date: '2026-05-09', icon: '🍔' },
  { id: '3', description: 'Netflix subscription', category: 'Subscription', amount: 15.99, type: 'expense', date: '2026-05-08', icon: '🎬' },
  { id: '4', description: 'Freelance payment', category: 'Freelance', amount: 650, type: 'income', date: '2026-05-07', icon: '💻' },
  { id: '5', description: 'Gas station', category: 'Transport', amount: 45.00, type: 'expense', date: '2026-05-06', icon: '🚗' },
  { id: '6', description: 'Restaurant dinner', category: 'Food', amount: 62.30, type: 'expense', date: '2026-05-05', icon: '🍔' },
  { id: '7', description: 'Uber ride', category: 'Transport', amount: 12.50, type: 'expense', date: '2026-05-04', icon: '🚗' },
  { id: '8', description: 'Amazon purchase', category: 'Shopping', amount: 129.99, type: 'expense', date: '2026-05-03', icon: '🛍️' },
  { id: '9', description: 'Gym membership', category: 'Health', amount: 39.99, type: 'expense', date: '2026-05-02', icon: '💊' },
  { id: '10', description: 'Electric bill', category: 'Utilities', amount: 85.00, type: 'expense', date: '2026-05-01', icon: '⚡' },
  { id: '11', description: 'Coffee shop', category: 'Food', amount: 5.50, type: 'expense', date: '2026-04-30', icon: '🍔' },
  { id: '12', description: 'Rent payment', category: 'Rent', amount: 1200, type: 'expense', date: '2026-04-28', icon: '🏠' },
  { id: '13', description: 'Concert tickets', category: 'Entertainment', amount: 75.00, type: 'expense', date: '2026-04-25', icon: '🎬' },
  { id: '14', description: 'Bonus payment', category: 'Salary', amount: 500, type: 'income', date: '2026-04-22', icon: '💼' },
  { id: '15', description: 'Pharmacy', category: 'Health', amount: 22.80, type: 'expense', date: '2026-04-20', icon: '💊' },
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
    // Navigate to detail — wire up router later
    console.log('Selected transaction:', id);
  }
}
