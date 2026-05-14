import { Component, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CountUpDirective } from '../../../../shared/directives/count-up.directive';
import { StatCardData } from './stat-card.types';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-stat-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, NgIcon, CountUpDirective, TranslatePipe],
  providers: [provideIcons(ICONS)],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  data = input.required<StatCardData>();

  /** Compact mode for smaller spaces */
  compact = input<boolean>(false);

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
    if (d.prefix || d.suffix) {
      const parts: string[] = [];
      if (d.prefix) parts.push(d.prefix);
      parts.push(value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      if (d.suffix) parts.push(d.suffix);
      return parts.join('');
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
