import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'ftCurrency',
  standalone: true,
  pure: false,
})
export class FtCurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number, format: 'full' | 'short' = 'full'): string {
    return format === 'short'
      ? this.currencyService.formatShort(value)
      : this.currencyService.format(value);
  }
}
