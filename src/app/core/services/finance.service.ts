import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Summary } from "../models/summary.model";
import { Transaction, TransactionFilters } from "../models/transaction.model";
import { Category } from "../models/category.model";
import { ChartData } from "../models/chart.model";
import { Insight } from "../models/insight.model";
import type { BankBreakdownItem } from './bank.service';

@Injectable({ providedIn: "root" })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  // ── Summary ──────────────────────────────────────────────────────────────

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.base}/summary`);
  }

  // ── Transactions ─────────────────────────────────────────────────────────

  getTransactions(filters?: TransactionFilters): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params = params.set(k, String(v));
      });
    }
    return this.http.get<Transaction[]>(`${this.base}/transactions`, {
      params,
    });
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.base}/transactions/${id}`);
  }

  createTransaction(
    payload: Omit<Transaction, "id" | "createdAt">,
  ): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/transactions`, payload);
  }

  updateTransaction(
    id: string,
    payload: Partial<Transaction>,
  ): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.base}/transactions/${id}`,
      payload,
    );
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/transactions/${id}`);
  }

  // ── Categories ───────────────────────────────────────────────────────────

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  createCategory(
    payload: Omit<Category, 'id' | 'total' | 'isDefault'>,
  ): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories`, payload);
  }

  updateCategory(
    id: string,
    payload: Partial<Omit<Category, 'id' | 'total' | 'isDefault'>>,
  ): Observable<Category> {
    return this.http.put<Category>(`${this.base}/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  // ── Chart ─────────────────────────────────────────────────────────────────

  getMonthlyChart(months?: number): Observable<ChartData[]> {
    let params = new HttpParams();
    if (months) params = params.set('months', months);
    return this.http.get<ChartData[]>(`${this.base}/chart/monthly`, { params });
  }

  // ── Insights ──────────────────────────────────────────────────────────────

  getInsights(): Observable<Insight[]> {
    return this.http.get<Insight[]>(`${this.base}/insights`);
  }

  // ── Bank Breakdown ────────────────────────────────────────────────────────

  getBankBreakdown(): Observable<BankBreakdownItem[]> {
    return this.http.get<BankBreakdownItem[]>(`${this.base}/analytics/bank-breakdown`);
  }
}
