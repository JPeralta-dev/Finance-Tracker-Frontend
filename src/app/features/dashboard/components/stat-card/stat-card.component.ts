import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { StatCardData } from './stat-card.types';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'ft-stat-card',
  standalone: true,
  imports: [CommonModule, NgIcon, FtSubtleRevealDirective, TranslatePipe],
  providers: [provideIcons(ICONS)],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  private currencyService = inject(CurrencyService);

  data = input.required<StatCardData>();

  /** Compact mode for smaller spaces */
  compact = input<boolean>(false);

  /** Count-up prefix: currency symbol for monetary values, empty for percentages */
  readonly countUpPrefix = computed(() => {
    const d = this.data();
    // If data has explicit prefix, use it
    if (d.prefix !== undefined) return d.prefix;
    // If data has a suffix (like '%'), it's a percentage — no currency symbol
    if (d.suffix !== undefined) return '';
    // Otherwise use currency symbol
    return this.currencyService.currencyConfig().symbol;
  });

  /** Count-up suffix falls back to data().suffix (e.g. '%' for savings rate) */
  readonly countUpSuffix = computed(() => this.data().suffix ?? '');

  /** Locale from CurrencyService for proper number formatting */
  readonly countUpLocale = computed(() => this.currencyService.currencyConfig().locale);

  /** Computed trend direction */
  readonly trendDirection = computed<'up' | 'down' | 'neutral'>(() => {
    const t = this.data().trend ?? 0;
    return t > 0 ? 'up' : t < 0 ? 'down' : 'neutral';
  });

  /** Computed trend label text */
  readonly trendLabel = computed<string>(() => {
    const t = Math.abs(this.data().trend ?? 0);
    return t > 0 ? `${t.toFixed(1)}%` : '';
  });

  formatValue(value: number): string {
    const d = this.data();
    const absoluteValue = Math.abs(value);
    const signPrefix = d.sign ?? '';
    if (d.prefix || d.suffix) {
      const parts: string[] = [];
      if (d.prefix) parts.push(d.prefix);
      parts.push(signPrefix + absoluteValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      if (d.suffix) parts.push(d.suffix);
      return parts.join('');
    }
    return signPrefix + absoluteValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
