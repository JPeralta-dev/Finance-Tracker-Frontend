import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FtCurrencyPipe } from './ft-currency.pipe';
import { CurrencyService } from '../services/currency.service';
import { TranslationService } from '../services/translation.service';

// Test host to verify pure pipe re-evaluation on service signal changes
@Component({
  standalone: true,
  imports: [FtCurrencyPipe],
  template: `<span>{{ value | ftCurrency: format }}</span>`,
})
class TestHostComponent {
  value = 1234.5;
  format: 'full' | 'short' = 'full';
}

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

  it('should re-render when currency config changes via effect + markForCheck', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent, FtCurrencyPipe],
      providers: [CurrencyService],
    });

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    // Initial format in USD
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('$1,234.50');

    // Change currency — the effect should trigger markForCheck
    currencyService.setCurrency({ symbol: '€', locale: 'de-DE' });

    tick();
    fixture.detectChanges();

    // After currency change, pipe should re-evaluate with new config
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('€1.234,50');
  }));
});
