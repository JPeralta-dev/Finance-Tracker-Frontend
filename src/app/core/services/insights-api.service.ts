import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ActionableInsight, FinancialHealthOverview } from '../models/insight.model';

export interface ActionableInsightsResponse {
  insights: ActionableInsight[];
}

@Injectable({ providedIn: 'root' })
export class InsightsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/insights`;

  /**
   * GET /api/insights/overview
   * Returns financial health score (0-100), levels, summary headline, and goals radar overview.
   */
  getHealthOverview(): Observable<FinancialHealthOverview> {
    return this.http.get<FinancialHealthOverview>(`${this.base}/overview`).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  /**
   * GET /api/insights
   * Returns enriched actionable insights sorted by severity and priority.
   */
  getActionableInsights(): Observable<ActionableInsightsResponse> {
    return this.http.get<ActionableInsightsResponse>(this.base).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }
}
