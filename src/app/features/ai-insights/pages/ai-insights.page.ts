import {
  Component,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';

import { IconComponent } from '../../../shared/icons/icon.component';
import { FinanceService } from '../../../core/services/finance.service';
import { Insight } from '../../../core/models/insight.model';

type PageState = 'loading' | 'ready' | 'empty' | 'error';

interface DisplayInsight {
  id: string;
  icon: string;
  typeLabel: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  borderColor: string;
}

@Component({
  selector: 'ft-ai-insights-page',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './ai-insights.page.html',
  styleUrl: './ai-insights.page.scss',
})
export class AiInsightsPage implements OnInit {
  private readonly financeService = inject(FinanceService);

  readonly insights = signal<DisplayInsight[]>([]);
  readonly state = signal<PageState>('loading');

  ngOnInit(): void {
    this.loadInsights();
  }

  // ─── Load insights ─────────────────────────────────────────────

  loadInsights(): void {
    this.state.set('loading');
    this.financeService.getInsights().pipe(
      catchError(() => {
        this.state.set('error');
        return of([]);
      }),
    ).subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.state.set('empty');
          this.insights.set([]);
        } else {
          const displayInsights = data.map(ins => this.mapToDisplayInsight(ins));
          this.insights.set(displayInsights);
          this.state.set('ready');
        }
      },
    });
  }

  // ─── Map to display insight ────────────────────────────────────

  private mapToDisplayInsight(insight: Insight): DisplayInsight {
    const iconMap: Record<string, string> = {
      trend: 'trending-up',
      warning: 'alert-triangle',
      info: 'search',
      success: 'circle-dollar',
    };

    const typeLabelMap: Record<string, string> = {
      trend: 'Proyección',
      warning: 'Alerta',
      info: 'Análisis',
      success: 'Oportunidad',
    };

    const borderColorMap: Record<string, string> = {
      low: 'var(--info, #A78BFA)',
      medium: 'var(--warning, #FFD93D)',
      high: 'var(--danger, #FF6B6B)',
    };

    return {
      id: insight.id,
      icon: iconMap[insight.type] ?? 'chart',
      typeLabel: typeLabelMap[insight.type] ?? 'Insight',
      title: insight.titleKey,
      message: insight.messageKey,
      severity: insight.severity,
      timestamp: this.relativeTimestamp(),
      borderColor: borderColorMap[insight.severity] ?? 'var(--accent-start)',
    };
  }

  // ─── Relative timestamp (simulated for now) ────────────────────

  /** Generate a relative timestamp string. In production, this would use the actual insight timestamp. */
  private relativeTimestamp(): string {
    // Since the current insight model doesn't have timestamps, we show a generic label
    return '';
  }

  // ─── Retry ─────────────────────────────────────────────────────

  retry(): void {
    this.loadInsights();
  }
}
