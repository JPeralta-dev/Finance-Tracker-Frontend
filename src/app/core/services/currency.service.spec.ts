import { TestBed } from '@angular/core/testing';
import { CurrencyService, CurrencyConfig } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrencyService],
    });
    service = TestBed.inject(CurrencyService);
  });

  describe('Default configuration', () => {
    it('should have USD as default currency', () => {
      const config = service.currencyConfig();
      expect(config.code).toBe('USD');
      expect(config.symbol).toBe('$');
      expect(config.locale).toBe('en-US');
      expect(config.decimals).toBe(2);
    });
  });

  describe('format()', () => {
    it('should format 1234.5 as $1,234.50 with default config', () => {
      expect(service.format(1234.5)).toBe('$1,234.50');
    });

    it('should format 0 as $0.00', () => {
      expect(service.format(0)).toBe('$0.00');
    });

    it('should format negative values correctly', () => {
      expect(service.format(-500)).toBe('$-500.00');
    });
  });

  describe('formatShort()', () => {
    it('should format 1500000 as $1.5M', () => {
      expect(service.formatShort(1500000)).toBe('$1.5M');
    });

    it('should format 2500 as $2.5k', () => {
      expect(service.formatShort(2500)).toBe('$2.5k');
    });

    it('should format values under 1000 with full format', () => {
      expect(service.formatShort(999)).toBe('$999.00');
    });

    it('should format 1000000 as $1.0M', () => {
      expect(service.formatShort(1000000)).toBe('$1.0M');
    });
  });

  describe('setCurrency()', () => {
    it('should update config with partial currency settings', () => {
      service.setCurrency({ code: 'EUR', symbol: '€' });
      const config = service.currencyConfig();
      expect(config.code).toBe('EUR');
      expect(config.symbol).toBe('€');
      expect(config.locale).toBe('en-US'); // unchanged
      expect(config.decimals).toBe(2); // unchanged
    });

    it('should format with EUR symbol after changing currency', () => {
      service.setCurrency({ code: 'EUR', symbol: '€', locale: 'de-DE' });
      expect(service.format(99.9)).toBe('€99,90');
    });

    it('should format with 0 decimals after changing decimals', () => {
      service.setCurrency({ decimals: 0 });
      expect(service.format(100.5)).toBe('$101');
    });
  });
});
