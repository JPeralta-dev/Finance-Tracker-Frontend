import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionRowComponent } from './transaction-row.component';
import { CurrencyService } from '../../../../core/services/currency.service';
import { TransactionRowData } from '../../transaction.types';

describe('TransactionRowComponent — Currency Integration', () => {
  let component: TransactionRowComponent;
  let fixture: ComponentFixture<TransactionRowComponent>;
  let currencyService: CurrencyService;

  const mockData: TransactionRowData = {
    id: '1',
    description: 'Grocery Store',
    category: 'Food',
    amount: 75.50,
    type: 'expense',
    date: '2024-01-15',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionRowComponent],
      providers: [CurrencyService],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionRowComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService);
    fixture.componentRef.setInput('data', mockData);
  });

  it('should format amount with currency service', () => {
    fixture.detectChanges();
    const result = component.formatAmount(1234.5);
    expect(result).toBe('$1,234.50');
  });

  it('should use EUR format after currency change', () => {
    currencyService.setCurrency({ symbol: '€', locale: 'de-DE' });
    fixture.detectChanges();
    const result = component.formatAmount(99.9);
    expect(result).toBe('€99,90');
  });
});
