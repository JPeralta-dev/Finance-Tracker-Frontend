import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ICONS } from '../../../../shared/icons/icon-registry';
import type { KpiData } from '../../analytics.types';

@Component({
  selector: 'ft-kpi-card',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  private currencyService = inject(CurrencyService);

  data = input.required<KpiData>();
  animated = input(true);

  readonly trendDirection = computed<'up' | 'down' | 'neutral'>(() => {
    const t = this.data().trend;
    return t > 0 ? 'up' : t < 0 ? 'down' : 'neutral';
  });

  currencySymbol(): string {
    return this.currencyService.currencyConfig().symbol;
  }

  formatValue(value: number): string {
    return value.toLocaleString(this.currencyService.currencyConfig().locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  absTrend(): string {
    return Math.abs(this.data().trend).toFixed(1);
  }

  normalizeChartValue(v: number): number {
    const chart = this.data().chart ?? [];
    const max = Math.max(...chart, 1);
    return (v / max) * 100;
  }
}
