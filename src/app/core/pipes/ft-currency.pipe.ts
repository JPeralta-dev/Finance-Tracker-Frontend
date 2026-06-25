import { Pipe, PipeTransform, inject, ChangeDetectorRef, effect } from '@angular/core';
import { CurrencyService } from '../services/currency.service';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'ftCurrency',
  standalone: true,
  pure: true,
})
export class FtCurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Re-evaluate when currency config or language changes
    effect(() => {
      this.currencyService.currencyConfig();
      this.translationService.currentLang();
      this.cdr.markForCheck();
    });
  }

  transform(value: number, format: 'full' | 'short' = 'full'): string {
    return format === 'short'
      ? this.currencyService.formatShort(value)
      : this.currencyService.format(value);
  }
}
