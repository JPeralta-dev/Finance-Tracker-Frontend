import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';

@Component({
  selector: 'ft-analytics-chart-card',
  standalone: true,
  imports: [CommonModule, FtSubtleRevealDirective],
  templateUrl: './analytics-chart-card.component.html',
  styleUrl: './analytics-chart-card.component.scss',
})
export class AnalyticsChartCardComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  fullWidth = input(false);
  height = input<string>('300px');
  revealDelay = input(0);
}
