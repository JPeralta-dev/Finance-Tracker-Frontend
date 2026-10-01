import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CategoriesComponent } from './categories.component';
import { CurrencyService } from '../../core/services/currency.service';
import { FinanceService } from '../../core/services/finance.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import { of, Subject } from 'rxjs';
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
    expect(totalExpensesEl.textContent).toContain('1.5k');
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


  it("should calculate percentages independently for income and expense categories", fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    // Food is 1500 expense out of 1500 total expenses = 100%
    const foodCat = mockCategories[0];
    expect(component.categoryPercentage(foodCat)).toBe(100);

    // Salary is 5000 income out of 5000 total income = 100%
    const salaryCat = mockCategories[1];
    expect(component.categoryPercentage(salaryCat)).toBe(100);
  }));

  it("should filter categories when activeTab changes", fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.setActiveTab("expense");
    fixture.detectChanges();
    let compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll(".cat-card--expense").length).toBe(1);
    expect(compiled.querySelectorAll(".cat-card--income").length).toBe(0);

    component.setActiveTab("income");
    fixture.detectChanges();
    compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll(".cat-card--expense").length).toBe(0);
    expect(compiled.querySelectorAll(".cat-card--income").length).toBe(1);
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
  let modalService: jasmine.SpyObj<ModalService>;

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

    modalService = jasmine.createSpyObj('ModalService', ['openCategoryModal'], {
      categorySaved$: new Subject<void>(),
    });

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        CurrencyService,
        { provide: FinanceService, useValue: financeService },
        { provide: ToastService, useValue: toastService },
        { provide: ModalService, useValue: modalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
  });

  it('should call modalService.openCategoryModal when openCreateForm is called', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.openCreateForm();
    fixture.detectChanges();

    expect(modalService.openCategoryModal).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: '', kind: 'expense' })
    );
  }));

  it('should call modalService.openCategoryModal with category data when openEditForm is called', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const cat = mockCategories[0];
    component.openEditForm(cat);
    fixture.detectChanges();

    expect(modalService.openCategoryModal).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: cat.name, icon: cat.icon, color: cat.color, kind: cat.kind }),
      cat.id
    );
  }));

  it('should reload categories when modal emits categorySaved', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const savedSpy = spyOn(component as any, 'loadCategories').and.callThrough();
    (modalService.categorySaved$ as Subject<void>).next();

    expect(savedSpy).toHaveBeenCalled();
  }));
});
