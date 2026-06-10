import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import type { Insight } from '../../../core/models/insight.model';

@Component({
  selector: 'ft-insights-panel',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './insights-panel.component.html',
  styleUrl: './insights-panel.component.scss',
})
export class InsightsPanelComponent {
  @Input() insights: Insight[] = [];
  @Input() loading = false;

  typeIcon(type: string): string {
    switch (type) {
      case 'warning': return '!';
      case 'success': return '+';
      case 'info': return 'i';
      case 'trend': return '~';
      default: return '*';
    }
  }

  severityClass(severity: string): string {
    switch (severity) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return '';
    }
  }
}
