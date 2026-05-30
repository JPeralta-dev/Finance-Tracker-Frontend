import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CategoriesComponent } from './categories.component';
import { CurrencyService } from '../../core/services/currency.service';
import { FinanceService } from '../../core/services/finance.service';
import { ToastService } from '../../core/services/toast.service';
import { of } from 'rxjs';
import { Category } from '../../core/models/category.model';

describe('CategoriesComponent — Currency Integration', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let currencyService: CurrencyService;

  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Food',
      icon: 'food',
      color: '#FF6B6B',
      kind: 'expense',
      total: 1500,
      isDefault: false,
    },
    {
      id: '2',
      name: 'Salary',
      icon: 'income',
      color: '#06D6A0',
      kind: 'income',
      total: 5000,
      isDefault: true,
    },
  ];

  beforeEach(async () => {
    const financeSpy = jasmine.createSpyObj('FinanceService', ['getCategories']);
    financeSpy.getCategories.and.returnValue(of(mockCategories));

    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        CurrencyService,
        { provide: FinanceService, useValue: financeSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    currencyService = TestBed.inject(CurrencyService);
  });

  it('should use ftCurrency pipe for total expenses in stats row', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const statValues = compiled.querySelectorAll('.stat-value');
    // The third stat-value is totalExpenses
    const totalExpensesEl = statValues[2];
    expect(totalExpensesEl.textContent).toContain('$');
    // ftCurrency:'short' renders 6500 as $6.5k
    expect(totalExpensesEl.textContent).toContain('6.5k');
  }));

  it('should use ftCurrency pipe for category totals', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const catTotals = compiled.querySelectorAll('.cat-total');
    expect(catTotals.length).toBe(2);
    expect(catTotals[0].textContent).toContain('$');
    expect(catTotals[1].textContent).toContain('$');
  }));

  it('should reflect EUR symbol after currency change', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    currencyService.setCurrency({ symbol: '€', locale: 'de-DE' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const catTotals = compiled.querySelectorAll('.cat-total');
    expect(catTotals[0].textContent).toContain('€');
  }));
});
