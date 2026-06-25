import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'

import { environment } from '../../../environments/environment'
import type { BankSummary, Bank } from '../models/bank.model'

export interface BankBreakdownItem {
  bankId: string
  bankName: string
  logoUrl: string | null
  total: number
  count: number
}

@Injectable({ providedIn: 'root' })
export class BankService {
  private readonly http = inject(HttpClient)
  private readonly base = `${environment.apiUrl}/api`

  getBanks(params?: { country?: string; search?: string }): Observable<BankSummary[]> {
    let httpParams = new HttpParams()
    if (params?.country) httpParams = httpParams.set('country', params.country)
    if (params?.search) httpParams = httpParams.set('search', params.search)
    return this.http.get<BankSummary[]>(`${this.base}/banks`, { params: httpParams })
  }

  searchBanks(query: string): Observable<BankSummary[]> {
    return this.http.get<BankSummary[]>(`${this.base}/banks/search`, {
      params: { q: query },
    })
  }

  getBankById(id: string): Observable<Bank> {
    return this.http.get<Bank>(`${this.base}/banks/${id}`)
  }

  createBank(payload: { name: string; countryCode: string; domain?: string | null; aliases?: string[] }): Observable<Bank> {
    return this.http.post<Bank>(`${this.base}/banks`, payload)
  }

  getBankBreakdown(): Observable<BankBreakdownItem[]> {
    return this.http.get<BankBreakdownItem[]>(`${this.base}/analytics/bank-breakdown`)
  }
}
