import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { AnalyticsApiService, AnalyticsInsight } from '../../analytics/services/analytics-api.service';
import { TranslationService } from '../../../core/services/translation.service';
import { DateRangeService } from '../../../core/services/date-range.service';
import { catchError, of } from 'rxjs';

interface InsightCard {
  icon: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'trend';
  severity: string;
}

@Component({
  selector: 'ft-insights-page',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    TranslatePipe,
    FtSubtleRevealDirective,
    EmptyStateComponent,
  ],
  templateUrl: './insights.page.html',
  styleUrl: './insights.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightsPage implements OnInit {
  private readonly api = inject(AnalyticsApiService);
  private readonly i18n = inject(TranslationService);
  private readonly dateRange = inject(DateRangeService);

  readonly pageState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly insights = signal<InsightCard[]>([]);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadInsights();
  }

  retry(): void {
    this.loadInsights();
  }

  private loadInsights(): void {
    this.pageState.set('loading');
    const params = this.dateRange.apiParams();

    this.api.getInsights(params.range, params.bankId, params.type, params.category).pipe(
      catchError((err) => {
        this.errorMessage.set(err?.message || this.i18n.translate('insights.errorLoading'));
        this.pageState.set('error');
        return of({ insights: [] });
      }),
    ).subscribe({
      next: (res) => {
        const cards: InsightCard[] = (res.insights || []).map((ins: AnalyticsInsight) => {
          const iconMap: Record<string, string> = {
            spending: 'trendingUp', savings: 'wallet', anomaly: 'alertTriangle',
            positive: 'star', subscription: 'repeat',
            warning: 'alertTriangle', info: 'info', success: 'star', trend: 'trendingUp',
          };
          const typeMap: Record<string, 'success' | 'warning' | 'info' | 'trend'> = {
            high: 'warning', medium: 'info', low: 'success',
            warning: 'warning', info: 'info', success: 'success', trend: 'trend',
          };
          return {
            icon: iconMap[ins.type] ?? 'info',
            title: this.i18n.translate(`analytics.insight.${ins.type}`),
            message: ins.messageKey ? this.i18n.translate(ins.messageKey, ins.params || ins.data || {}) : '',
            type: typeMap[ins.severity] ?? typeMap[ins.type] ?? 'info',
            severity: ins.severity,
          };
        });
        this.insights.set(cards);
        this.pageState.set('ready');
      },
    });
  }
}
