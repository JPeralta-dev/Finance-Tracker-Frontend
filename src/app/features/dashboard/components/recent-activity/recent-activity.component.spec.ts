import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RecentActivityComponent, ActivityItem } from './recent-activity.component';
import { CurrencyService } from '../../../../core/services/currency.service';

describe('RecentActivityComponent — Currency Integration', () => {
  let component: RecentActivityComponent;
  let fixture: ComponentFixture<RecentActivityComponent>;
  let currencyService: CurrencyService;

  const mockItems: ActivityItem[] = [
    {
      id: '1',
      description: 'Salary',
      category: 'Income',
      amount: 5000,
      type: 'income',
      date: '2024-01-15',
    },
    {
      id: '2',
      description: 'Groceries',
      category: 'Food',
      amount: 75.50,
      type: 'expense',
      date: '2024-01-16',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivityComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [CurrencyService],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivityComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService);
    fixture.componentRef.setInput('items', mockItems);
  });

  it('should format income with + and currency symbol', () => {
    fixture.detectChanges();
    const result = component.formatAmount(mockItems[0]);
    expect(result).toBe('+$5,000.00');
  });

  it('should format expense with - and currency symbol', () => {
    fixture.detectChanges();
    const result = component.formatAmount(mockItems[1]);
    expect(result).toBe('-$75.50');
  });

  it('should use EUR symbol after currency change', () => {
    currencyService.setCurrency({ symbol: '€', locale: 'de-DE' });
    fixture.detectChanges();
    const result = component.formatAmount(mockItems[0]);
    expect(result).toBe('+€5.000,00');
  });
});
