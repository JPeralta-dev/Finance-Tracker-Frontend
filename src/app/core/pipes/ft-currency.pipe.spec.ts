import { TestBed } from '@angular/core/testing';
import { FtCurrencyPipe } from './ft-currency.pipe';
import { CurrencyService } from '../services/currency.service';

describe('FtCurrencyPipe', () => {
  let pipe: FtCurrencyPipe;
  let currencyService: CurrencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrencyService, FtCurrencyPipe],
    });
    pipe = TestBed.inject(FtCurrencyPipe);
    currencyService = TestBed.inject(CurrencyService);
  });

  it('should format with full format by default', () => {
    expect(pipe.transform(1234.5)).toBe('$1,234.50');
  });

  it('should format with full format when explicitly specified', () => {
    expect(pipe.transform(1234.5, 'full')).toBe('$1,234.50');
  });

  it('should format with short format', () => {
    expect(pipe.transform(1500000, 'short')).toBe('$1.5M');
  });

  it('should format 2500 as $2.5k in short format', () => {
    expect(pipe.transform(2500, 'short')).toBe('$2.5k');
  });

  it('should react to currency changes (pure: false)', () => {
    expect(pipe.transform(99.9)).toBe('$99.90');
    currencyService.setCurrency({ symbol: '€', locale: 'de-DE' });
    expect(pipe.transform(99.9)).toBe('€99,90');
  });
});
