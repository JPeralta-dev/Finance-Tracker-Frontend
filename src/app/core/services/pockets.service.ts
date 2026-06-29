import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PocketResponse, CreatePocketDto, UpdatePocketDto, PocketSpending } from '../models/pocket.model';

@Injectable({ providedIn: 'root' })
export class PocketsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/pockets`;

  list(): Observable<PocketResponse[]> {
    return this.http.get<PocketResponse[]>(this.base);
  }

  create(dto: CreatePocketDto): Observable<PocketResponse> {
    return this.http.post<PocketResponse>(this.base, dto);
  }

  update(id: string, dto: UpdatePocketDto): Observable<PocketResponse> {
    return this.http.patch<PocketResponse>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getSpending(pocketId: string): Observable<PocketSpending> {
    return this.http.get<PocketSpending>(`${this.base}/${pocketId}/spending`);
  }
}
