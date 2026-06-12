import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { ICONS } from '../../../../shared/icons/icon-registry';
import type { InsightData } from '../../analytics.types';

@Component({
  selector: 'ft-analytics-insights',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './analytics-insights.component.html',
  styleUrl: './analytics-insights.component.scss',
})
export class AnalyticsInsightsComponent {
  insights = input.required<InsightData[]>();
  loading = input(false);
}
