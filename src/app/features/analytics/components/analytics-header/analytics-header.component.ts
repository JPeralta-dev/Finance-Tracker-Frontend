import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { ICONS } from '../../../../shared/icons/icon-registry';

export type PeriodOption = '1m' | '3m' | '6m' | '1y';

@Component({
  selector: 'ft-analytics-header',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './analytics-header.component.html',
  styleUrl: './analytics-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsHeaderComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  variation = input<number | null>(null);
  period = input<PeriodOption>('1m');
  periodChange = output<PeriodOption>();

  readonly periods: { value: PeriodOption; labelKey: string }[] = [
    { value: '1m', labelKey: 'analytics.period.1m' },
    { value: '3m', labelKey: 'analytics.period.3m' },
    { value: '6m', labelKey: 'analytics.period.6m' },
    { value: '1y', labelKey: 'analytics.period.1y' },
  ];

  isPositive(): boolean {
    return (this.variation() ?? 0) >= 0;
  }

  absVariation(): string {
    return Math.abs(this.variation() ?? 0).toFixed(1);
  }
}
