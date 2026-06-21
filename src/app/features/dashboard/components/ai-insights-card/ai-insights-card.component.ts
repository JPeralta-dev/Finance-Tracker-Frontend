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
import { FinanceService } from '../../../../core/services/finance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Insight } from '../../../../core/models/insight.model';

type InsightsState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-ai-insights-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './ai-insights-card.component.html',
  styleUrl: './ai-insights-card.component.scss',
})
export class AiInsightsCardComponent implements OnInit {
  private readonly financeService = inject(FinanceService);
  private readonly authService = inject(AuthService);

  readonly insights = signal<Insight[]>([]);
  readonly state = signal<InsightsState>('loading');

  readonly isPremium = this.authService.isPremium;

  readonly iconMap: Record<string, string> = {
    warning: 'alert-triangle',
    info: 'chart',
    success: 'circle-dollar',
    trend: 'trending-up',
  };

  readonly severityColors: Record<string, string | undefined> = {
    low: 'var(--info, #A78BFA)',
    medium: 'var(--warning, #FFD93D)',
    high: 'var(--danger, #FF6B6B)',
  };

  readonly displayInsights = computed(() => this.insights().slice(0, 3));

  ngOnInit(): void {
    if (!this.isPremium()) {
      this.state.set('ready');
      return;
    }
    this.loadInsights();
  }

  private loadInsights(): void {
    this.state.set('loading');
    this.financeService
      .getInsights()
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.state.set('empty');
          } else {
            this.insights.set(data);
            this.state.set('ready');
          }
        },
        error: () => {
          this.state.set('error');
        },
      });
  }
}
