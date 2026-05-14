import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import { Summary } from "../models/summary.model";
import { Transaction, TransactionFilters } from "../models/transaction.model";
import { Category } from "../models/category.model";
import { ChartData } from "../models/chart.model";

@Injectable({ providedIn: "root" })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  // ── Summary ──────────────────────────────────────────────────────────────

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.base}/summary`);
    // MOCK: return of(MOCK_SUMMARY).pipe(delay(800));
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
    // MOCK: return of(MOCK_TRANSACTIONS).pipe(delay(800));
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.base}/transactions/${id}`);
    // MOCK: return of(MOCK_TRANSACTIONS[0]).pipe(delay(600));
  }

  createTransaction(
    payload: Omit<Transaction, "id" | "createdAt">,
  ): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/transactions`, payload);
    // MOCK: return of({ ...payload, id: '99', createdAt: new Date().toISOString() }).pipe(delay(900));
  }

  updateTransaction(
    id: string,
    payload: Partial<Transaction>,
  ): Observable<Transaction> {
    return this.http.put<Transaction>(
      `${this.base}/transactions/${id}`,
      payload,
    );
    // MOCK: return of({ ...payload, id } as Transaction).pipe(delay(900));
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/transactions/${id}`);
    // MOCK: return of(undefined).pipe(delay(600));
  }

  // ── Categories ───────────────────────────────────────────────────────────

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
    // MOCK: return of(MOCK_CATEGORIES).pipe(delay(700));
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

  getMonthlyChart(): Observable<ChartData[]> {
    return this.http.get<ChartData[]>(`${this.base}/chart/monthly`);
    // MOCK: return of(MOCK_CHART_DATA).pipe(delay(700));
  }
}
