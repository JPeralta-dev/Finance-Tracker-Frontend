import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CategoriesComponent } from './categories.component';
import { CurrencyService } from '../../core/services/currency.service';
import { FinanceService } from '../../core/services/finance.service';
import { ToastService } from '../../core/services/toast.service';
import { of } from 'rxjs';
import { Category } from '../../core/models/category.model';
import { By } from '@angular/platform-browser';

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
    const totalExpensesEl = statValues[2];
    expect(totalExpensesEl.textContent).toContain('$');
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

describe('CategoriesComponent — Modal Animation', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let financeService: jasmine.SpyObj<FinanceService>;
  let toastService: jasmine.SpyObj<ToastService>;

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
    financeService = jasmine.createSpyObj('FinanceService', ['getCategories', 'createCategory', 'updateCategory']);
    financeService.getCategories.and.returnValue(of(mockCategories));

    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        CurrencyService,
        { provide: FinanceService, useValue: financeService },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
  });

  it('should not render modal overlay initially', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(overlay).toBeNull();
  }));

  it('should render modal overlay when showForm is true', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.openCreateForm();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(overlay).toBeTruthy();
  }));

  it('should have modal-backdrop and modal-content elements', fakeAsync(() => {
    component.openCreateForm();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    const content = fixture.debugElement.query(By.css('.modal-content'));
    expect(backdrop).toBeTruthy();
    expect(content).toBeTruthy();
  }));

  it('should close modal when backdrop is clicked', fakeAsync(() => {
    component.openCreateForm();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    backdrop.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(component.showForm()).toBe(false);
  }));

  it('should close modal when close button is clicked', fakeAsync(() => {
    component.openCreateForm();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const closeBtn = fixture.debugElement.query(By.css('.modal-close'));
    closeBtn.triggerEventHandler('click', {});
    fixture.detectChanges();

    expect(component.showForm()).toBe(false);
  }));

  it('should close form after successful submit', fakeAsync(() => {
    financeService.createCategory.and.returnValue(of({ id: '3', name: 'Test', icon: 'T', color: '#fff', kind: 'expense', total: 0, isDefault: false }));

    component.openCreateForm();
    component.formName.set('Test');
    fixture.detectChanges();

    component.submitForm();
    tick();
    fixture.detectChanges();

    expect(component.showForm()).toBe(false);
    expect(toastService.success).toHaveBeenCalled();
  }));

  it('should open edit form with correct data', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const cat = mockCategories[0];
    component.openEditForm(cat);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.showForm()).toBe(true);
    expect(component.editingCategory()).toEqual(cat);
    expect(component.formName()).toBe(cat.name);
    expect(component.formColor()).toBe(cat.color);
  }));
});
