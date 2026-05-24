import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StatCardComponent } from './stat-card.component';
import { CurrencyService } from '../../../../core/services/currency.service';
import { StatCardData } from './stat-card.types';

describe('StatCardComponent — Currency Integration', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;
  let currencyService: CurrencyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent, HttpClientTestingModule],
      providers: [CurrencyService],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService);
  });

  describe('countUpPrefix', () => {
    it('should return currency symbol for monetary values (no suffix)', () => {
      fixture.componentRef.setInput('data', {
        id: '1', label: 'Balance', value: 1000,
      } as StatCardData);
      fixture.detectChanges();
      expect(component.countUpPrefix()).toBe('$');
    });

    it('should update when currency changes', () => {
      fixture.componentRef.setInput('data', {
        id: '1', label: 'Balance', value: 1000,
      } as StatCardData);
      fixture.detectChanges();
      expect(component.countUpPrefix()).toBe('$');

      currencyService.setCurrency({ symbol: '€' });
      fixture.detectChanges();
      expect(component.countUpPrefix()).toBe('€');
    });

    it('should return empty prefix for percentage values (has suffix)', () => {
      fixture.componentRef.setInput('data', {
        id: '4', label: 'Savings', value: 99.9, suffix: '%',
      } as StatCardData);
      fixture.detectChanges();
      expect(component.countUpPrefix()).toBe('');
    });

    it('should use explicit prefix from data when provided', () => {
      fixture.componentRef.setInput('data', {
        id: '5', label: 'Custom', value: 50, prefix: '~',
      } as StatCardData);
      fixture.detectChanges();
      expect(component.countUpPrefix()).toBe('~');
    });
  });

  describe('countUpSuffix', () => {
    it('should return suffix from data when set', () => {
      fixture.componentRef.setInput('data', {
        id: '4', label: 'Savings', value: 99.9, suffix: '%',
      } as StatCardData);
      fixture.detectChanges();
      expect(component.countUpSuffix()).toBe('%');
    });

    it('should return empty suffix when data has none', () => {
      fixture.componentRef.setInput('data', {
        id: '1', label: 'Balance', value: 1000,
      } as StatCardData);
      fixture.detectChanges();
      expect(component.countUpSuffix()).toBe('');
    });
  });

  describe('countUpLocale', () => {
    it('should return locale from CurrencyService', () => {
      fixture.componentRef.setInput('data', {
        id: '1', label: 'Balance', value: 1000,
      } as StatCardData);
      fixture.detectChanges();
      expect(component.countUpLocale()).toBe('en-US');
    });

    it('should update when currency locale changes', () => {
      fixture.componentRef.setInput('data', {
        id: '1', label: 'Balance', value: 1000,
      } as StatCardData);
      fixture.detectChanges();

      currencyService.setCurrency({ locale: 'de-DE' });
      fixture.detectChanges();
      expect(component.countUpLocale()).toBe('de-DE');
    });
  });
});
