import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ICONS } from '../../../../shared/icons/icon-registry';
import type { ComparisonData } from '../../analytics.types';

@Component({
  selector: 'ft-analytics-comparison',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './analytics-comparison.component.html',
  styleUrl: './analytics-comparison.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComparisonComponent {
  comparisons = input.required<ComparisonData[]>();
  loading = input(false);

  constructor(private currencyService: CurrencyService) {}

  formatCurrency(v: number): string {
    return this.currencyService.format(v);
  }

  maxWidth(a: number, b: number): number {
    const max = Math.max(a, b, 1);
    return Math.min((a / max) * 100, 100);
  }
}
