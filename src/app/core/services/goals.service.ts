import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Goal, CreateGoalDto, UpdateGoalDto, GoalProjection } from '../models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.base}/goals`);
  }

  getGoalById(id: string): Observable<Goal> {
    return this.http.get<Goal>(`${this.base}/goals/${id}`);
  }

  createGoal(dto: CreateGoalDto): Observable<Goal> {
    return this.http.post<Goal>(`${this.base}/goals`, dto);
  }

  updateGoal(id: string, dto: UpdateGoalDto): Observable<Goal> {
    return this.http.put<Goal>(`${this.base}/goals/${id}`, dto);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/goals/${id}`);
  }

  getGoalProjection(id: string): Observable<GoalProjection> {
    return this.http.get<GoalProjection>(`${this.base}/goals/${id}/projection`);
  }
}
