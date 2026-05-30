import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsPage, calculateNetSavings, mapCategoryToDonut, mapMonthlyChartData } from './analytics.page';
import { FinanceService } from '../../../core/services/finance.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TranslationService } from '../../../core/services/translation.service';
import { of, throwError } from 'rxjs';
import type { ChartData } from '../../../core/models/chart.model';
import type { Category } from '../../../core/models/category.model';

describe('AnalyticsPage', () => {
  let component: AnalyticsPage;
  let fixture: ComponentFixture<AnalyticsPage>;
  let financeServiceSpy: jasmine.SpyObj<FinanceService>;
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;

  const mockTranslationService = {
    translate: (key: string) => key,
  };

  const mockChartData: ChartData[] = [
    { month: 'Jan', income: 3000, expenses: 2000 },
    { month: 'Feb', income: 3500, expenses: 2200 },
    { month: 'Mar', income: 2800, expenses: 2500 },
  ];

  const mockCategories: Category[] = [
    { id: '1', name: 'Food', icon: 'food', color: '#ff0', kind: 'expense', total: 500, isDefault: false },
    { id: '2', name: 'Transport', icon: 'transport', color: '#0ff', kind: 'expense', total: 300, isDefault: false },
    { id: '3', name: 'Salary', icon: 'salary', color: '#0f0', kind: 'income', total: 5000, isDefault: false },
  ];

  const mockSummary = {
    totalBalance: 10000,
    totalIncome: 9300,
    totalExpenses: 6700,
    savingsRate: 28,
  };

  beforeEach(() => {
    financeServiceSpy = jasmine.createSpyObj('FinanceService', [
      'getMonthlyChart',
      'getCategories',
      'getSummary',
    ]);
    currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['format'], {
      currencyConfig: () => ({ code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 }),
    });
    currencyServiceSpy.format.and.callFake((v: number) => `$${v.toFixed(2)}`);

    TestBed.configureTestingModule({
      imports: [AnalyticsPage],
      providers: [
        { provide: FinanceService, useValue: financeServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    });

    fixture = TestBed.createComponent(AnalyticsPage);
    component = fixture.componentInstance;
  });

  describe('Pure functions', () => {
    describe('calculateNetSavings()', () => {
      it('should return positive savings when income > expenses', () => {
        expect(calculateNetSavings(5000, 3000)).toBe(2000);
      });

      it('should return negative savings when expenses > income', () => {
        expect(calculateNetSavings(2000, 3000)).toBe(-1000);
      });

      it('should return zero when income equals expenses', () => {
        expect(calculateNetSavings(3000, 3000)).toBe(0);
      });
    });

    describe('mapCategoryToDonut()', () => {
      it('should filter expense categories and map to DonutData', () => {
        const colors = ['#A', '#B', '#C'];
        const result = mapCategoryToDonut(mockCategories, colors);

        expect(result.labels).toEqual(['Food', 'Transport']);
        expect(result.data).toEqual([500, 300]);
        expect(result.colors).toEqual(['#A', '#B']);
      });

      it('should return empty DonutData when no expense categories have totals', () => {
        const noExpenseCats: Category[] = [
          { id: '1', name: 'Salary', icon: 'salary', color: '#0f0', kind: 'income', total: 5000, isDefault: false },
        ];
        const result = mapCategoryToDonut(noExpenseCats, ['#A']);

        expect(result.labels).toEqual([]);
        expect(result.data).toEqual([]);
        expect(result.colors).toEqual([]);
      });

      it('should cycle colors when more categories than colors', () => {
        const manyCats: Category[] = [
          { id: '1', name: 'A', icon: 'a', color: '#a', kind: 'expense', total: 100, isDefault: false },
          { id: '2', name: 'B', icon: 'b', color: '#b', kind: 'expense', total: 200, isDefault: false },
          { id: '3', name: 'C', icon: 'c', color: '#c', kind: 'expense', total: 300, isDefault: false },
          { id: '4', name: 'D', icon: 'd', color: '#d', kind: 'expense', total: 400, isDefault: false },
        ];
        const result = mapCategoryToDonut(manyCats, ['#A', '#B']);

        expect(result.colors).toEqual(['#A', '#B', '#A', '#B']);
      });
    });

    describe('mapMonthlyChartData()', () => {
      it('should map chart data to labels and datasets', () => {
        const colors = { income: '#green', expense: '#red', categories: [] };
        const result = mapMonthlyChartData(mockChartData, colors);

        expect(result.labels).toEqual(['Jan', 'Feb', 'Mar']);
        expect(result.datasets.length).toBe(2);
        expect(result.datasets[0].label).toBe('Income');
        expect(result.datasets[0].data).toEqual([3000, 3500, 2800]);
        expect(result.datasets[0].color).toBe('#green');
        expect(result.datasets[1].label).toBe('Expenses');
        expect(result.datasets[1].data).toEqual([2000, 2200, 2500]);
        expect(result.datasets[1].color).toBe('#red');
      });

      it('should handle empty chart data', () => {
        const colors = { income: '#green', expense: '#red', categories: [] };
        const result = mapMonthlyChartData([], colors);

        expect(result.labels).toEqual([]);
        expect(result.datasets[0].data).toEqual([]);
        expect(result.datasets[1].data).toEqual([]);
      });
    });
  });

  describe('Component state transitions', () => {
    it('should start in loading state', () => {
      expect(component.state()).toBe('loading');
    });

    it('should transition to ready state when data loads successfully', () => {
      financeServiceSpy.getMonthlyChart.and.returnValue(of(mockChartData));
      financeServiceSpy.getCategories.and.returnValue(of(mockCategories));
      financeServiceSpy.getSummary.and.returnValue(of(mockSummary));

      component.ngOnInit();

      expect(component.state()).toBe('ready');
    });

    it('should populate monthly chart data on successful load', () => {
      financeServiceSpy.getMonthlyChart.and.returnValue(of(mockChartData));
      financeServiceSpy.getCategories.and.returnValue(of(mockCategories));
      financeServiceSpy.getSummary.and.returnValue(of(mockSummary));

      component.ngOnInit();

      expect(component.monthlyLabels()).toEqual(['Jan', 'Feb', 'Mar']);
      expect(component.monthlyDatasets().length).toBe(2);
    });

    it('should populate donut data with expense categories only', () => {
      financeServiceSpy.getMonthlyChart.and.returnValue(of(mockChartData));
      financeServiceSpy.getCategories.and.returnValue(of(mockCategories));
      financeServiceSpy.getSummary.and.returnValue(of(mockSummary));

      component.ngOnInit();

      const donut = component.donutData();
      expect(donut.labels).toEqual(['Food', 'Transport']);
      expect(donut.data).toEqual([500, 300]);
    });

    it('should calculate summary totals from loaded data', () => {
      financeServiceSpy.getMonthlyChart.and.returnValue(of(mockChartData));
      financeServiceSpy.getCategories.and.returnValue(of(mockCategories));
      financeServiceSpy.getSummary.and.returnValue(of(mockSummary));

      component.ngOnInit();

      expect(component.totalIncome()).toBe(9300);
      expect(component.totalExpense()).toBe(6700);
      expect(component.netSavings()).toBe(2600);
    });

    it('should transition to error state when all requests fail', () => {
      financeServiceSpy.getMonthlyChart.and.returnValue(throwError(() => new Error('fail')));
      financeServiceSpy.getCategories.and.returnValue(throwError(() => new Error('fail')));
      financeServiceSpy.getSummary.and.returnValue(throwError(() => new Error('fail')));

      component.ngOnInit();

      expect(component.state()).toBe('error');
    });

    it('should transition to empty state when summary shows zero activity', () => {
      const emptySummary = { totalBalance: 0, totalIncome: 0, totalExpenses: 0, savingsRate: 0 };
      financeServiceSpy.getMonthlyChart.and.returnValue(of([]));
      financeServiceSpy.getCategories.and.returnValue(of([]));
      financeServiceSpy.getSummary.and.returnValue(of(emptySummary));

      component.ngOnInit();

      expect(component.state()).toBe('empty');
    });

    it('should use CurrencyService.format for monetary values', () => {
      financeServiceSpy.getMonthlyChart.and.returnValue(of(mockChartData));
      financeServiceSpy.getCategories.and.returnValue(of(mockCategories));
      financeServiceSpy.getSummary.and.returnValue(of(mockSummary));

      component.ngOnInit();

      expect(component.formatAmount(9300)).toBe('$9300.00');
      expect(currencyServiceSpy.format).toHaveBeenCalledWith(9300);
    });

    it('should reload data when retry() is called', () => {
      financeServiceSpy.getMonthlyChart.and.returnValue(of(mockChartData));
      financeServiceSpy.getCategories.and.returnValue(of(mockCategories));
      financeServiceSpy.getSummary.and.returnValue(of(mockSummary));

      component.ngOnInit();
      component.retry();

      expect(financeServiceSpy.getMonthlyChart).toHaveBeenCalledTimes(2);
    });
  });
});
