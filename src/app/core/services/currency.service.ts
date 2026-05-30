import { Injectable, signal } from '@angular/core';

export interface CurrencyConfig {
  code: string;      // 'USD' | 'EUR' | etc.
  symbol: string;    // '$' | '€' | etc.
  locale: string;    // 'en-US' | 'de-DE' | etc.
  decimals: number;  // 2
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly config = signal<CurrencyConfig>({
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
  });

  readonly currencyConfig = this.config.asReadonly();

  setCurrency(config: Partial<CurrencyConfig>): void {
    this.config.update(current => ({ ...current, ...config }));
  }

  format(value: number): string {
    const c = this.config();
    return `${c.symbol}${value.toLocaleString(c.locale, { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals })}`;
  }

  formatShort(value: number): string {
    if (value >= 1000000) return `${this.config().symbol}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${this.config().symbol}${(value / 1000).toFixed(1)}k`;
    return this.format(value);
  }
}
