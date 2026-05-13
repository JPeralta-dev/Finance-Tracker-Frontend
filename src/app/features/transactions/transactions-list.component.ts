import { Component, OnInit, signal, computed, inject } from "@angular/core";
import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { FinanceService } from "../../core/services/finance.service";
import { Transaction } from "../../core/models/transaction.model";
import { SkeletonComponent } from "../../shared/components/skeleton.component";
import { EmptyStateComponent } from "../../shared/components/empty-state.component";
import { staggerList, rowEntrance, fadeSlideIn } from "../../shared/animations";

type SortKey = "date" | "amount" | "category";

@Component({
  selector: "app-transactions-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    SkeletonComponent,
    EmptyStateComponent,
  ],
  animations: [staggerList, rowEntrance, fadeSlideIn],
  template: `
    <div class="tx-page" @fadeSlideIn>
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Transactions</h1>
          <p class="subtitle">
            {{ filteredTransactions().length }} transactions
          </p>
        </div>
        <a routerLink="/transactions/new" class="btn-primary">+ New</a>
      </div>

      <!-- Error banner -->
      @if (loadError()) {
        <div class="error-banner">
          {{ loadError() }}
          <button class="retry-btn" (click)="loadTransactions()">Retry</button>
        </div>
      }

      <!-- Delete success toast -->
      @if (deleteMsg()) {
        <div class="toast" @fadeSlideIn>{{ deleteMsg() }}</div>
      }

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-wrap">
          <span class="search-icon">Search</span>
          <input
            type="text"
            placeholder="Search transactions…"
            [(ngModel)]="searchQuery"
            class="search-input"
          />
        </div>

        <select [(ngModel)]="filterType" class="filter-select">
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select [(ngModel)]="filterCategory" class="filter-select">
          <option value="">All categories</option>
          @for (cat of categories(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>

        <button
          class="clear-btn"
          (click)="clearFilters()"
          [disabled]="!hasFilters()"
        >
          Clear
        </button>
      </div>

      <!-- Table -->
      <div class="table-wrap">
        @if (loading()) {
          <div class="table-skeleton">
            @for (s of [1, 2, 3, 4, 5, 6]; track s) {
              <div class="skeleton-row">
                <app-skeleton width="36px" height="36px" radius="10px" />
                <div class="sk-text">
                  <app-skeleton height="14px" width="180px" radius="4px" />
                  <app-skeleton height="12px" width="90px" radius="4px" />
                </div>
                <app-skeleton height="14px" width="80px" radius="4px" />
                <app-skeleton height="14px" width="70px" radius="4px" />
                <app-skeleton height="14px" width="90px" radius="4px" />
              </div>
            }
          </div>
        } @else if (paginatedTransactions().length === 0) {
          <ft-empty-state
            icon="list"
            title="No transactions found"
            description="Try adjusting your filters or add a new transaction."
            actionRoute="/transactions/new"
            actionLabel="+ New Transaction"
          />
        } @else {
          <!-- Column headers -->
          <div class="table-header">
            <span class="col-icon"></span>
            <span class="col-desc">Description</span>
            <span class="col-sortable col-cat" (click)="setSort('category')">
              Category
              <span class="sort-icon">{{ sortIndicator("category") }}</span>
            </span>
            <span class="col-sortable col-date" (click)="setSort('date')">
              Date <span class="sort-icon">{{ sortIndicator("date") }}</span>
            </span>
            <span class="col-sortable col-amount" (click)="setSort('amount')">
              Amount
              <span class="sort-icon">{{ sortIndicator("amount") }}</span>
            </span>
            <span class="col-actions"></span>
          </div>

          <div [@staggerList]="paginatedTransactions().length">
            @for (tx of paginatedTransactions(); track tx.id) {
              <div
                class="table-row"
                @rowEntrance
                [class.deleting]="deletingId() === tx.id"
              >
                <div
                  class="tx-icon"
                  [style.background]="categoryColor(tx.category)"
                >
                  {{ categoryIcon(tx.category) }}
                </div>
                <div class="tx-info">
                  <span class="tx-desc">{{ tx.description }}</span>
                  <span class="tx-type" [class]="tx.type">{{ tx.type }}</span>
                </div>
                <span class="tx-cat">
                  <span class="cat-chip">{{ tx.category }}</span>
                </span>
                <span class="tx-date">{{ tx.date | date: "MMM d, yyyy" }}</span>
                <span
                  class="tx-amount"
                  [class.income]="tx.type === 'income'"
                  [class.expense]="tx.type === 'expense'"
                >
                  {{ tx.type === "income" ? "+" : "-"
                  }}{{ tx.amount | currency: "USD" : "symbol" : "1.0-0" }}
                </span>
                <div class="tx-actions">
                  <a
                    [routerLink]="['/transactions', tx.id]"
                    class="action-btn edit"
                    title="Edit"
                    >Edit</a
                  >
                  <button
                    class="action-btn delete"
                    (click)="deleteTransaction(tx.id)"
                    [disabled]="deletingId() === tx.id"
                    title="Delete"
                  >
                    {{ deletingId() === tx.id ? "Deleting" : "Delete" }}
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button
                class="page-btn"
                (click)="prevPage()"
                [disabled]="currentPage() === 1"
              >
                ← Prev
              </button>
              <div class="page-numbers">
                @for (p of pageNumbers(); track p) {
                  <button
                    class="page-num"
                    [class.active]="p === currentPage()"
                    (click)="goToPage(p)"
                  >
                    {{ p }}
                  </button>
                }
              </div>
              <button
                class="page-btn"
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
              >
                Next →
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .tx-page {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      h1 {
        font-family: "Poppins", sans-serif;
        font-size: 32px;
        font-weight: 700;
        color: #111;
        margin: 0;
        letter-spacing: -0.5px;
      }
      .subtitle {
        color: #888;
        margin: 4px 0 0;
        font-size: 14px;
      }
      .btn-primary {
        padding: 10px 20px;
        background: #223843;
        color: white;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.15s ease;
      }
      .btn-primary:hover {
        background: #1A2D36;
        transform: translateY(-1px);
      }
      .btn-primary:active {
        transform: scale(0.97);
      }

      /* Error / Toast */
      .error-banner {
        background: rgba(255, 92, 77, 0.08);
        border: 1px solid rgba(255, 92, 77, 0.25);
        color: #223843;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .retry-btn {
        margin-left: auto;
        padding: 6px 14px;
        background: #223843;
        color: white;
        border: none;
        border-radius: 7px;
        font-size: 13px;
        cursor: pointer;
        font-family: "Roboto", sans-serif;
      }
      .retry-btn:hover {
        background: #1A2D36;
      }
      .toast {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.25);
        color: #10b981;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
      }

      /* Filters */
      .filters-bar {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
      }
      .search-wrap {
        position: relative;
        flex: 1;
        min-width: 200px;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 14px;
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 9px 12px 9px 36px;
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        font-size: 14px;
        font-family: "Roboto", sans-serif;
        background: white;
        color: #111;
        transition: border-color 0.15s;
        box-sizing: border-box;
      }
      .search-input:focus {
        outline: none;
        border-color: #223843;
      }
      .filter-select {
        padding: 9px 14px;
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        font-size: 14px;
        font-family: "Roboto", sans-serif;
        background: white;
        color: #111;
        cursor: pointer;
      }
      .filter-select:focus {
        outline: none;
        border-color: #223843;
      }
      .clear-btn {
        padding: 9px 16px;
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        font-size: 13px;
        font-family: "Roboto", sans-serif;
        background: white;
        color: #666;
        cursor: pointer;
        transition: all 0.15s;
      }
      .clear-btn:hover:not(:disabled) {
        border-color: #223843;
        color: #223843;
      }
      .clear-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Table */
      .table-wrap {
        background: white;
        border-radius: 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
        overflow: hidden;
      }
      .table-skeleton {
        padding: 8px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .skeleton-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 13px 8px;
      }
      .sk-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .table-header {
        display: grid;
        grid-template-columns: 40px 1fr 130px 110px 110px 80px;
        gap: 12px;
        padding: 12px 20px;
        background: #fafafa;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        font-size: 11px;
        font-weight: 700;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }
      .col-sortable {
        cursor: pointer;
        user-select: none;
        transition: color 0.15s;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .col-sortable:hover {
        color: #223843;
      }
      .col-amount {
        justify-content: flex-end;
      }
      .sort-icon {
        font-size: 10px;
      }
      .table-row {
        display: grid;
        grid-template-columns: 40px 1fr 130px 110px 110px 80px;
        gap: 12px;
        padding: 13px 20px;
        align-items: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        transition:
          background 0.15s,
          opacity 0.2s;
      }
      .table-row:last-child {
        border-bottom: none;
      }
      .table-row:hover {
        background: #fafaf8;
      }
      .table-row.deleting {
        opacity: 0.4;
        pointer-events: none;
      }
      .tx-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        flex-shrink: 0;
      }
      .tx-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .tx-desc {
        font-size: 14px;
        font-weight: 500;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tx-type {
        font-size: 11px;
        font-weight: 600;
        text-transform: capitalize;
        width: fit-content;
        padding: 1px 7px;
        border-radius: 99px;
      }
      .tx-type.income {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      .tx-type.expense {
        background: rgba(255, 92, 77, 0.1);
        color: #223843;
      }
      .cat-chip {
        font-size: 12px;
        font-weight: 500;
        color: #666;
        background: #f3f3f0;
        padding: 3px 10px;
        border-radius: 20px;
      }
      .tx-date {
        font-size: 13px;
        color: #888;
      }
      .tx-amount {
        font-size: 14px;
        font-weight: 700;
        text-align: right;
      }
      .tx-amount.income {
        color: #10b981;
      }
      .tx-amount.expense {
        color: #223843;
      }
      .tx-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
        opacity: 0;
        transition: opacity 0.15s;
      }
      .table-row:hover .tx-actions {
        opacity: 1;
      }
      .action-btn {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.15s;
        border: none;
        background: transparent;
      }
      .action-btn:hover {
        background: rgba(0, 0, 0, 0.06);
      }
      .action-btn.delete:hover {
        background: rgba(255, 92, 77, 0.1);
      }
      .action-btn:disabled {
        cursor: not-allowed;
      }

      /* Pagination */
      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }
      .page-btn {
        padding: 7px 14px;
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        background: white;
        font-family: "Roboto", sans-serif;
        font-size: 13px;
        cursor: pointer;
        color: #555;
        transition: all 0.15s;
      }
      .page-btn:hover:not(:disabled) {
        border-color: #223843;
        color: #223843;
      }
      .page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .page-numbers {
        display: flex;
        gap: 4px;
      }
      .page-num {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        border: 1.5px solid transparent;
        background: none;
        font-family: "Roboto", sans-serif;
        font-size: 13px;
        cursor: pointer;
        color: #555;
        transition: all 0.15s;
      }
      .page-num:hover {
        background: rgba(0, 0, 0, 0.05);
      }
      .page-num.active {
        background: #223843;
        color: white;
        border-color: #223843;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .table-header {
          display: none;
        }
        .table-row {
          grid-template-columns: 40px 1fr auto;
          grid-template-rows: auto auto;
        }
        .tx-cat,
        .tx-date,
        .tx-actions {
          display: none;
        }
        .tx-amount {
          grid-column: 3;
          grid-row: 1;
        }
      }
    `,
  ],
})
export class TransactionsListComponent implements OnInit {
  private financeService = inject(FinanceService);

  allTransactions = signal<Transaction[]>([]);
  loading = signal(true);
  loadError = signal("");
  deletingId = signal("");
  deleteMsg = signal("");

  searchQuery = "";
  filterType = "";
  filterCategory = "";
  sortKey = signal<SortKey>("date");
  sortDir = signal<"asc" | "desc">("desc");
  currentPage = signal(1);
  pageSize = 10;

  private CATEGORY_META: Record<string, { icon: string; color: string }> = {
    Food: { icon: "FD", color: "rgba(255,92,77,0.15)" },
    Transport: { icon: "TR", color: "rgba(77,166,255,0.15)" },
    Entertainment: { icon: "EN", color: "rgba(168,85,247,0.15)" },
    Shopping: { icon: "SH", color: "rgba(245,158,11,0.15)" },
    Health: { icon: "HL", color: "rgba(16,185,129,0.15)" },
    Rent: { icon: "RE", color: "rgba(99,102,241,0.15)" },
    Salary: { icon: "SA", color: "rgba(34,211,238,0.15)" },
    Freelance: { icon: "FR", color: "rgba(244,114,182,0.15)" },
    Utilities: { icon: "UT", color: "rgba(132,204,22,0.15)" },
  };

  categories = computed(() =>
    [...new Set(this.allTransactions().map((t) => t.category))].sort(),
  );

  hasFilters = computed(
    () => !!this.searchQuery || !!this.filterType || !!this.filterCategory,
  );

  filteredTransactions = computed(() => {
    let list = this.allTransactions();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }
    if (this.filterType) list = list.filter((t) => t.type === this.filterType);
    if (this.filterCategory)
      list = list.filter((t) => t.category === this.filterCategory);

    const key = this.sortKey();
    const dir = this.sortDir() === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (key === "amount") return (a.amount - b.amount) * dir;
      if (key === "date") return (a.date > b.date ? 1 : -1) * dir;
      return a.category.localeCompare(b.category) * dir;
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)),
  );
  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );
  paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading.set(true);
    this.loadError.set("");
    this.financeService.getTransactions().subscribe({
      next: (data) => {
        this.allTransactions.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set(
          err.status === 0
            ? "Cannot connect to backend. Is localhost:3000 running?"
            : `Error loading transactions (${err.status}).`,
        );
      },
    });
  }

  categoryIcon(cat: string) {
    return this.CATEGORY_META[cat]?.icon ?? "OT";
  }
  categoryColor(cat: string) {
    return this.CATEGORY_META[cat]?.color ?? "rgba(0,0,0,0.07)";
  }

  setSort(key: SortKey) {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      this.sortKey.set(key);
      this.sortDir.set("desc");
    }
    this.currentPage.set(1);
  }

  sortIndicator(key: SortKey) {
    if (this.sortKey() !== key) return "↕";
    return this.sortDir() === "asc" ? "↑" : "↓";
  }

  clearFilters() {
    this.searchQuery = "";
    this.filterType = "";
    this.filterCategory = "";
    this.currentPage.set(1);
  }

  goToPage(p: number) {
    this.currentPage.set(p);
  }
  prevPage() {
    this.currentPage.update((p) => Math.max(1, p - 1));
  }
  nextPage() {
    this.currentPage.update((p) => Math.min(this.totalPages(), p + 1));
  }

  deleteTransaction(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return;

    this.deletingId.set(id);
    this.financeService.deleteTransaction(id).subscribe({
      next: () => {
        this.allTransactions.update((list) => list.filter((t) => t.id !== id));
        this.deletingId.set("");
        this.deleteMsg.set("Transaction deleted successfully.");
        setTimeout(() => this.deleteMsg.set(""), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.deletingId.set("");
        alert(
          err.status === 404
            ? "Transaction not found."
            : "Failed to delete. Try again.",
        );
      },
    });
  }
}
