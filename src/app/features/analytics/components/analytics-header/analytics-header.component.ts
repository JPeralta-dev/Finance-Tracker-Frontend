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

  /** Human-readable date range display (e.g., "Jun 15, 2024 — Jul 15, 2024") */
  dateRangeDisplay = input<string>('');

  /** Custom date inputs */
  customStartDate = input<string>('');
  customEndDate = input<string>('');
  customDateChange = output<{ start: string; end: string }>();

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

  /** Handle custom date range submission */
  onCustomDateChange(): void {
    const start = this.customStartDate();
    const end = this.customEndDate();
    if (start && end) {
      this.customDateChange.emit({ start, end });
    }
  }

  /** Handle start date input change */
  onCustomDateStart(event: Event): void {
    const input = event.target as HTMLInputElement;
    const end = this.customEndDate() || input.value;
    this.customDateChange.emit({ start: input.value, end });
  }

  /** Handle end date input change */
  onCustomDateEnd(event: Event): void {
    const input = event.target as HTMLInputElement;
    const start = this.customStartDate() || input.value;
    this.customDateChange.emit({ start, end: input.value });
  }
}
