import {
  Component,
  input,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { IconComponent } from '../../../../shared/icons/icon.component';
import { GoalsService } from '../../../../core/services/goals.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Goal } from '../../../../core/models/goal.model';

type GoalsState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-goals-widget',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './goals-widget.component.html',
  styleUrl: './goals-widget.component.scss',
})
export class GoalsWidgetComponent implements OnInit {
  private readonly goalsService = inject(GoalsService);
  private readonly authService = inject(AuthService);

  readonly goals = signal<Goal[]>([]);
  readonly state = signal<GoalsState>('loading');

  readonly isPremium = this.authService.isPremium;

  readonly displayGoals = computed(() => this.goals().slice(0, 3));

  ngOnInit(): void {
    if (!this.isPremium()) {
      this.state.set('ready');
      return;
    }
    this.loadGoals();
  }

  private loadGoals(): void {
    this.state.set('loading');
    this.goalsService
      .getGoals()
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.state.set('empty');
          } else {
            this.goals.set(data.filter((g) => g.status === 'active'));
            this.state.set('ready');
          }
        },
        error: () => {
          this.state.set('error');
        },
      });
  }

  /** Calculate progress percentage */
  progress(goal: Goal): number {
    if (goal.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  }

  /** Calculate remaining amount */
  remaining(goal: Goal): number {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  }

  /** Format number as currency */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  }

  /** Estimate months until goal based on current rate */
  estimatedMonths(goal: Goal): number | null {
    const remaining = this.remaining(goal);
    if (remaining <= 0) return 0;
    // Rough estimate: assume monthly savings ≈ currentAmount / monthsSinceStart
    const created = new Date(goal.createdAt);
    const now = new Date();
    const monthsElapsed = Math.max(1, (now.getTime() - created.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const monthlyRate = goal.currentAmount / monthsElapsed;
    if (monthlyRate <= 0) return null;
    return Math.ceil(remaining / monthlyRate);
  }
}
