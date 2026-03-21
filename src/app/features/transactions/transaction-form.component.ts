import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

import { FinanceService } from "../../core/services/finance.service";
import { fadeSlideIn, cardEntrance } from "../../shared/animations";

const CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Health",
  "Rent",
  "Salary",
  "Freelance",
  "Utilities",
  "Other",
];

@Component({
  selector: "app-transaction-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  animations: [fadeSlideIn, cardEntrance],
  template: `
    <div class="form-page" @fadeSlideIn>
      <a routerLink="/transactions" class="back-link">← Back to transactions</a>

      <div class="form-card" @cardEntrance>
        <div class="form-header">
          <h1>{{ isEdit() ? "Edit Transaction" : "New Transaction" }}</h1>
          <p class="subtitle">
            {{
              isEdit()
                ? "Update the details below"
                : "Fill in the details to record a transaction"
            }}
          </p>
        </div>

        @if (loadingEdit()) {
          <div class="loading-skeleton">
            @for (s of [1, 2, 3, 4, 5]; track s) {
              <div class="sk-field">
                <div class="sk-label"></div>
                <div class="sk-input"></div>
              </div>
            }
          </div>
        } @else {
          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="tx-form"
            novalidate
          >
            <!-- Type toggle -->
            <div class="form-group">
              <label class="form-label">Type</label>
              <div class="type-toggle">
                <button
                  type="button"
                  class="type-btn"
                  [class.active-income]="form.get('type')?.value === 'income'"
                  (click)="form.get('type')?.setValue('income')"
                >
                  Income
                </button>
                <button
                  type="button"
                  class="type-btn"
                  [class.active-expense]="form.get('type')?.value === 'expense'"
                  (click)="form.get('type')?.setValue('expense')"
                >
                  Expense
                </button>
              </div>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label" for="amount">Amount</label>
              <div class="input-wrap currency-wrap">
                <span class="currency-symbol">$</span>
                <input
                  id="amount"
                  type="number"
                  formControlName="amount"
                  placeholder="0.00"
                  class="form-input currency-input"
                  [class.error]="isInvalid('amount')"
                  min="0"
                  step="0.01"
                />
              </div>
              @if (isInvalid("amount")) {
                <span class="error-msg">
                  @if (form.get("amount")?.errors?.["required"]) {
                    Amount is required.
                  }
                  @if (form.get("amount")?.errors?.["min"]) {
                    Amount must be greater than 0.
                  }
                </span>
              }
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label" for="description">Description</label>
              <div class="input-wrap">
                <input
                  id="description"
                  type="text"
                  formControlName="description"
                  placeholder="e.g. Monthly groceries"
                  class="form-input"
                  [class.error]="isInvalid('description')"
                />
              </div>
              @if (isInvalid("description")) {
                <span class="error-msg">Description is required.</span>
              }
            </div>

            <!-- Category -->
            <div class="form-group">
              <label class="form-label" for="category">Category</label>
              <div class="input-wrap">
                <select
                  id="category"
                  formControlName="category"
                  class="form-input form-select"
                  [class.error]="isInvalid('category')"
                >
                  <option value="" disabled>Select a category</option>
                  @for (cat of categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>
              @if (isInvalid("category")) {
                <span class="error-msg">Please select a category.</span>
              }
            </div>

            <!-- Date -->
            <div class="form-group">
              <label class="form-label" for="date">Date</label>
              <div class="input-wrap">
                <input
                  id="date"
                  type="date"
                  formControlName="date"
                  class="form-input"
                  [class.error]="isInvalid('date')"
                />
              </div>
              @if (isInvalid("date")) {
                <span class="error-msg">Date is required.</span>
              }
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <a routerLink="/transactions" class="btn-cancel">Cancel</a>
              <button
                type="submit"
                class="btn-submit"
                [class.loading]="submitting()"
                [disabled]="submitting()"
              >
                @if (submitting()) {
                  <span class="spinner"></span> Saving…
                } @else {
                  {{ isEdit() ? "Update Transaction" : "Add Transaction" }}
                }
              </button>
            </div>

            @if (successMsg()) {
              <div class="success-banner" @fadeSlideIn>
                {{ successMsg() }}
              </div>
            }
            @if (errorMsg()) {
              <div class="error-banner" @fadeSlideIn>{{ errorMsg() }}</div>
            }
          </form>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .form-page {
        max-width: 580px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .back-link {
        display: inline-flex;
        align-items: center;
        color: #888;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: color 0.15s;
        width: fit-content;
      }
      .back-link:hover {
        color: #ff5c4d;
      }
      .form-card {
        background: white;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
        padding: 32px;
      }
      .form-header {
        margin-bottom: 28px;
      }
      h1 {
        font-family: "Clash Display", sans-serif;
        font-size: 26px;
        font-weight: 700;
        color: #111;
        margin: 0;
        letter-spacing: -0.4px;
      }
      .subtitle {
        color: #888;
        font-size: 14px;
        margin: 6px 0 0;
      }
      .tx-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-label {
        font-size: 13px;
        font-weight: 600;
        color: #555;
      }
      .input-wrap {
        position: relative;
      }
      .currency-wrap {
        display: flex;
        align-items: center;
      }
      .currency-symbol {
        position: absolute;
        left: 14px;
        color: #999;
        font-size: 15px;
        pointer-events: none;
      }
      .form-input {
        width: 100%;
        padding: 11px 14px;
        border: 1.5px solid rgba(0, 0, 0, 0.12);
        border-radius: 10px;
        font-size: 15px;
        font-family: "DM Sans", sans-serif;
        color: #111;
        background: white;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
        box-sizing: border-box;
      }
      .currency-input {
        padding-left: 34px;
      }
      .form-input:focus {
        outline: none;
        border-color: #ff5c4d;
        box-shadow: 0 0 0 3px rgba(255, 92, 77, 0.1);
      }
      .form-input.error {
        border-color: #ff5c4d;
      }
      .form-select {
        cursor: pointer;
      }
      .error-msg {
        font-size: 12px;
        color: #ff5c4d;
        font-weight: 500;
      }
      .type-toggle {
        display: flex;
        gap: 10px;
      }
      .type-btn {
        flex: 1;
        padding: 11px 18px;
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        background: white;
        font-family: "DM Sans", sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        color: #555;
        transition: all 0.18s ease;
      }
      .type-btn:hover {
        border-color: rgba(0, 0, 0, 0.2);
      }
      .type-btn.active-income {
        background: rgba(16, 185, 129, 0.1);
        border-color: #10b981;
        color: #10b981;
        font-weight: 700;
      }
      .type-btn.active-expense {
        background: rgba(255, 92, 77, 0.1);
        border-color: #ff5c4d;
        color: #ff5c4d;
        font-weight: 700;
      }
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;
        align-items: center;
      }
      .btn-cancel {
        padding: 11px 22px;
        border: 1.5px solid rgba(0, 0, 0, 0.1);
        border-radius: 10px;
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        color: #555;
        transition: all 0.15s;
        background: white;
      }
      .btn-cancel:hover {
        border-color: rgba(0, 0, 0, 0.22);
      }
      .btn-submit {
        flex: 1;
        padding: 12px 22px;
        background: #ff5c4d;
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-family: "DM Sans", sans-serif;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .btn-submit:hover:not(:disabled) {
        background: #e54535;
        transform: translateY(-1px);
      }
      .btn-submit:active {
        transform: scale(0.97);
      }
      .btn-submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .success-banner {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
      }
      .error-banner {
        background: rgba(255, 92, 77, 0.08);
        border: 1px solid rgba(255, 92, 77, 0.25);
        color: #ff5c4d;
        padding: 12px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
      }
      .loading-skeleton {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .sk-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .sk-label {
        height: 13px;
        width: 80px;
        background: linear-gradient(
          90deg,
          #e8e8e4 25%,
          #f0f0ec 50%,
          #e8e8e4 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s ease-in-out infinite;
        border-radius: 4px;
      }
      .sk-input {
        height: 44px;
        width: 100%;
        background: linear-gradient(
          90deg,
          #e8e8e4 25%,
          #f0f0ec 50%,
          #e8e8e4 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.4s ease-in-out infinite;
        border-radius: 10px;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      @media (max-width: 640px) {
        .form-card {
          padding: 22px 18px;
        }
      }
    `,
  ],
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private financeService = inject(FinanceService);

  isEdit = signal(false);
  submitting = signal(false);
  loadingEdit = signal(false);
  successMsg = signal("");
  errorMsg = signal("");

  categories = CATEGORIES;
  private txId: string | null = null;

  form = this.fb.group({
    type: ["expense", Validators.required],
    amount: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
    description: ["", Validators.required],
    category: ["", Validators.required],
    date: [new Date().toISOString().split("T")[0], Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id && id !== "new") {
      this.isEdit.set(true);
      this.txId = id;
      this.loadingEdit.set(true);

      this.financeService.getTransactionById(id).subscribe({
        next: (tx) => {
          this.form.patchValue({
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            category: tx.category,
            date: tx.date.split("T")[0],
          });
          this.loadingEdit.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loadingEdit.set(false);
          this.errorMsg.set(
            err.status === 404
              ? "Transaction not found."
              : "Failed to load transaction. Is the backend running?",
          );
        },
      });
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.successMsg.set("");
    this.errorMsg.set("");

    const raw = this.form.value;
    const payload = {
      type: raw.type as "income" | "expense",
      amount: Number(raw.amount),
      description: raw.description!,
      category: raw.category!,
      date: new Date(raw.date!).toISOString(),
    };

    const obs$ = this.isEdit()
      ? this.financeService.updateTransaction(this.txId!, payload)
      : this.financeService.createTransaction(payload);

    obs$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMsg.set(
          this.isEdit() ? "Transaction updated." : "Transaction created.",
        );
        setTimeout(() => this.router.navigate(["/transactions"]), 900);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        if (err.status === 0) {
          this.errorMsg.set(
            "Cannot connect to backend. Is localhost:3000 running?",
          );
        } else if (err.status === 400) {
          this.errorMsg.set("Invalid data. Check all fields and try again.");
        } else if (err.status === 404) {
          this.errorMsg.set("Transaction not found.");
        } else {
          this.errorMsg.set(`Server error (${err.status}). Please try again.`);
        }
      },
    });
  }
}
