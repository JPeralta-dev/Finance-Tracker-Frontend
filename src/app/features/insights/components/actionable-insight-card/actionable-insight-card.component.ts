import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ActionableInsight, InsightAction, InsightCategory, InsightSeverity } from '../../../../core/models/insight.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtCurrencyPipe } from '../../../../core/pipes/ft-currency.pipe';

@Component({
  selector: 'ft-actionable-insight-card',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtCurrencyPipe],
  templateUrl: './actionable-insight-card.component.html',
  styleUrl: './actionable-insight-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionableInsightCardComponent {
  readonly insight = input.required<ActionableInsight>();

  readonly actionClick = output<{ action: InsightAction; insight: ActionableInsight }>();
  readonly dismiss = output<string>();

  getCategoryIcon(category: InsightCategory): string {
    switch (category) {
      case 'pacing_alert':
        return 'alertTriangle';
      case 'goal_impact':
        return 'clock';
      case 'smart_allocation':
        return 'wallet';
      case 'leak_optimization':
        return 'sparkles' || 'star';
      case 'positive_milestone':
        return 'star';
      case 'spending':
        return 'trendUp';
      case 'savings':
        return 'wallet';
      case 'anomaly':
        return 'warning';
      default:
        return 'info';
    }
  }

  getSeverityClass(severity: InsightSeverity): string {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'severity--high';
      case 'medium':
        return 'severity--medium';
      case 'low':
      default:
        return 'severity--low';
    }
  }

  onAction(action: InsightAction): void {
    this.actionClick.emit({
      action,
      insight: this.insight(),
    });
  }

  onDismiss(): void {
    this.dismiss.emit(this.insight().id);
  }
}
