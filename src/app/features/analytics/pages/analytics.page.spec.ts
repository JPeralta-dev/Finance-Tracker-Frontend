import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsPage, mapToKpis, mapToCategoryAnalysis, mapToRelevantTransactions, generateMonthStories } from './analytics.page';
import { AnalyticsApiService, AnalyticsSummary, MonthlyTrend, CategoryBreakdown, DailySpending, AnalyticsInsight, AnalyticsTransaction } from '../services/analytics-api.service';
import { AnalyticsStore } from '../services/analytics.store';
import { RuleBasedInsightsService } from '../services/insights.service';
import { EchartsThemeMapper } from '../../../shared/charts/echarts/echarts-theme.mapper';
import { CurrencyService } from '../../../core/services/currency.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ToastService } from '../../../core/services/toast.service';

describe('AnalyticsPage — Phase 3 Assembly', () => {
  let component: AnalyticsPage;
  let fixture: ComponentFixture<AnalyticsPage>;
  let httpMock: HttpTestingController;
  let store: AnalyticsStore;

  const mockSummary: AnalyticsSummary = {
    totalIncome: 5000,
    totalExpenses: 3200,
    netSavings: 1800,
    savingsRate: 36,
    incomeChange: 12,
    expenseChange: -5,
  };

  const mockTrend: MonthlyTrend = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    income: [4000, 4200, 3800, 4500, 4800, 5000],
    expenses: [3000, 3100, 3500, 2800, 3000, 3200],
  };

  const mockCategoryBreakdown: CategoryBreakdown = {
    categories: [
      { categoryId: 'food', category: 'Food', amount: 800, percentage: 25 },
      { categoryId: 'transport', category: 'Transport', amount: 400, percentage: 12.5 },
      { categoryId: 'entertainment', category: 'Entertainment', amount: 600, percentage: 18.75 },
      { categoryId: 'housing', category: 'Housing', amount: 1200, percentage: 37.5 },
      { categoryId: 'utilities', category: 'Utilities', amount: 200, percentage: 6.25 },
    ],
  };

  const mockDailySpending: DailySpending = {
    days: [
      { label: 'Mon', amount: 45 },
      { label: 'Tue', amount: 30 },
      { label: 'Wed', amount: 60 },
      { label: 'Thu', amount: 25 },
      { label: 'Fri', amount: 80 },
    ],
  };

  const mockInsights: AnalyticsInsight[] = [
    { type: 'spending', message: 'Spending increased 15% vs last month', messageKey: 'spending', severity: 'medium', actionable: true },
    { type: 'positive', message: 'Great savings rate!', messageKey: 'positive', severity: 'low', actionable: false },
  ];

  const mockTransactions: AnalyticsTransaction[] = [
    { id: '1', merchant: 'Uber', amount: -15, date: '2024-06-01', bank: 'Santander', category: 'Transport', icon: 'car', type: 'expense' },
    { id: '2', merchant: 'Salary', amount: 5000, date: '2024-06-01', bank: 'Santander', category: 'Salary', icon: 'briefcase', type: 'income' },
    { id: '3', merchant: 'Netflix', amount: -12, date: '2024-06-02', bank: 'Santander', category: 'Entertainment', icon: 'tv', type: 'expense' },
  ];

  const mockRawTransactions = [
    {
      id: '1', amount: -15, type: 'expense' as const, category: 'Transport', description: 'Uber',
      date: '2024-06-01', createdAt: '2024-06-01T10:00:00.000Z',
      bank: { id: 'santander', name: 'Santander', logoUrl: null },
    },
    {
      id: '2', amount: 5000, type: 'income' as const, category: 'Salary', description: 'Salary',
      date: '2024-06-01', createdAt: '2024-06-01T10:00:00.000Z',
      bank: { id: 'santander', name: 'Santander', logoUrl: null },
    },
    {
      id: '3', amount: -12, type: 'expense' as const, category: 'Entertainment', description: 'Netflix',
      date: '2024-06-02', createdAt: '2024-06-02T10:00:00.000Z',
      bank: { id: 'santander', name: 'Santander', logoUrl: null },
    },
  ];

  const mockBanks = { banks: [{ id: 'santander', name: 'Santander', logo: '/santander.png' }] };

  const mockTranslationService = {
    translate: (key: string) => key,
  } as unknown as TranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnalyticsPage],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        AnalyticsStore,
        RuleBasedInsightsService,
        EchartsThemeMapper,
        { provide: CurrencyService, useValue: { currencyConfig: () => ({ code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 }), format: (v: number) => `$${v.toFixed(2)}` } },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ToastService, useValue: { error: jasmine.createSpy('error') } },
      ],
    });

    fixture = TestBed.createComponent(AnalyticsPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AnalyticsStore);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Pure functions', () => {
    describe('mapToKpis()', () => {
      it('should return 4 KPI cards from summary + trend', () => {
        const kpis = mapToKpis(mockSummary, mockTrend, '$', mockTranslationService);
        expect(kpis.length).toBe(4);
        expect(kpis[0].labelKey).toBe('analytics.totalIncome');
        expect(kpis[0].value).toBe(5000);
        expect(kpis[1].labelKey).toBe('analytics.totalExpenses');
        expect(kpis[2].labelKey).toBe('analytics.netSavings');
        expect(kpis[3].labelKey).toBe('analytics.savingsRate');
      });

      it('should return empty array when summary is null', () => {
        const kpis = mapToKpis(null, mockTrend, '$', mockTranslationService);
        expect(kpis).toEqual([]);
      });
    });

    describe('mapToCategoryAnalysis()', () => {
      it('should map category breakdown to analysis array', () => {
        const colors = ['#A', '#B', '#C', '#D', '#E'];
        const result = mapToCategoryAnalysis(mockCategoryBreakdown, colors, mockTranslationService);
        expect(result.length).toBe(5);
        expect(result[0].name).toBe('Food');
        expect(result[0].percentage).toBe(25);
        expect(result[0].total).toBe(800);
      });

      it('should return empty array when breakdown is null', () => {
        const result = mapToCategoryAnalysis(null, ['#A'], mockTranslationService);
        expect(result).toEqual([]);
      });
    });

    describe('mapToRelevantTransactions()', () => {
      it('should map API transactions to UI format', () => {
        const result = mapToRelevantTransactions(mockTransactions);
        expect(result.length).toBe(3);
        expect(result[0].description).toBe('Uber');
        expect(result[0].type).toBe('expense');
        expect(result[1].type).toBe('income');
      });
    });

    describe('generateMonthStories()', () => {
      it('should generate positive story for high savings rate', () => {
        const stories = generateMonthStories(mockSummary, mockTrend, mockTranslationService);
        expect(stories.length).toBeGreaterThan(0);
        expect(stories.some(s => s.type === 'positive')).toBeTrue();
      });

      it('should generate neutral story when no notable events', () => {
        const emptySummary: AnalyticsSummary = {
          totalIncome: 0, totalExpenses: 0, netSavings: 0,
          savingsRate: 0, incomeChange: 0, expenseChange: 0,
        };
        const stories = generateMonthStories(emptySummary, null, mockTranslationService);
        expect(stories.length).toBe(1);
        expect(stories[0].type).toBe('neutral');
      });
    });
  });

  describe('Component integration', () => {
    it('should start in idle state (not loading until API called)', () => {
      expect(store.loadState()).toBe('idle');
    });

    it('should show loading state when store is loading', () => {
      store.setLoading();
      fixture.detectChanges();
      expect(component.isLoading()).toBeTrue();
    });

    it('should show error state when store has error', () => {
      store.setError('API failed');
      fixture.detectChanges();
      expect(component.isError()).toBeTrue();
      expect(component.errorMessage()).toBe('API failed');
    });

    it('should show welcome state for new user with zero data', () => {
      const zeroSummary: AnalyticsSummary = {
        totalIncome: 0, totalExpenses: 0, netSavings: 0,
        savingsRate: 0, incomeChange: 0, expenseChange: 0,
      };
      store.setSummary(zeroSummary);
      store.setReady();
      fixture.detectChanges();

      expect(component.isNewUser()).toBeTrue();
    });

    it('should show content state when data is available', () => {
      store.setSummary(mockSummary);
      store.setMonthlyTrend(mockTrend);
      store.setCategoryBreakdown(mockCategoryBreakdown);
      store.setReady();
      fixture.detectChanges();

      expect(component.showContent()).toBeTrue();
    });
  });

  describe('API integration with HttpTestingController', () => {
    it('should load all endpoints on init', fakeAsync(() => {
      fixture.detectChanges();

      // Flush all HTTP requests
      const reqs = httpMock.match(req => req.url.includes('/api/analytics/'));
      expect(reqs.length).toBeGreaterThanOrEqual(1); // At least banks call

      // Respond to banks
      reqs.forEach(req => {
        if (req.request.url.includes('/banks')) {
          req.flush(mockBanks);
        } else if (req.request.url.includes('/summary')) {
          req.flush(mockSummary);
        } else if (req.request.url.includes('/monthly-trend')) {
          req.flush(mockTrend);
        } else if (req.request.url.includes('/category-breakdown')) {
          req.flush(mockCategoryBreakdown);
        } else if (req.request.url.includes('/daily-spending')) {
          req.flush(mockDailySpending);
        } else if (req.request.url.includes('/insights')) {
          req.flush({ insights: mockInsights });
        } else if (req.request.url.includes('/transactions')) {
          req.flush(mockRawTransactions);
        } else {
          req.flush({});
        }
      });

      tick(100);
      fixture.detectChanges();

      expect(store.summary()).not.toBeNull();
      expect(store.transactions()[0]).toEqual({
        id: '1',
        merchant: 'Uber',
        amount: -15,
        type: 'expense',
        date: '2024-06-01',
        bank: 'Santander',
        category: 'Transport',
        icon: 'circle',
      });
      expect(component.uiTransactions()[0]).toEqual(jasmine.objectContaining({
        id: '1',
        description: 'Uber',
        amount: 15,
        type: 'expense',
        icon: 'circle',
      }));
      expect(component.uiTransactions().length).toBe(3);
      expect(store.loadState()).toBe('ready');
    }));

    it('should show error state when API fails', fakeAsync(() => {
      fixture.detectChanges();

      const reqs = httpMock.match(req => req.url.includes('/api/analytics/'));
      reqs.forEach(req => {
        if (req.request.url.includes('/banks')) {
          req.flush(mockBanks);
        } else {
          req.error(new ProgressEvent('error'));
        }
      });

      tick(100);
      fixture.detectChanges();

      expect(store.loadState()).toBe('error');
    }));
  });

  describe('Computed signals', () => {
    beforeEach(() => {
      store.setSummary(mockSummary);
      store.setMonthlyTrend(mockTrend);
      store.setCategoryBreakdown(mockCategoryBreakdown);
      store.setDailySpending(mockDailySpending);
      store.setInsights(mockInsights);
      store.setTransactions(mockTransactions);
      store.setReady();
    });

    it('should compute kpis from store data', () => {
      const kpis = component.kpis();
      expect(kpis.length).toBe(4);
    });

    it('should compute categoryAnalysis from store data', () => {
      const cats = component.categoryAnalysis();
      expect(cats.length).toBe(5);
    });

    it('should compute uiTransactions from store data', () => {
      const txs = component.uiTransactions();
      expect(txs.length).toBe(3);
    });

    it('should compute trendChartOptions from store data', () => {
      const opts = component.trendChartOptions();
      expect(opts).toBeDefined();
    });

    it('should compute donutChartOptions from store data', () => {
      const opts = component.donutChartOptions();
      expect(opts).toBeDefined();
    });

    it('should compute dailyChartOptions from store data', () => {
      const opts = component.dailyChartOptions();
      expect(opts).toBeDefined();
    });
  });

  describe('Filter actions', () => {
    it('should compute headerPeriod from store', () => {
      store.setPeriod('30d');
      expect(component.headerPeriod()).toBe('1m');
    });

    it('should map 7d store period to 1m header period', () => {
      store.setPeriod('7d');
      expect(component.headerPeriod()).toBe('1m');
    });

    it('should map 1y store period to 1y header period', () => {
      store.setPeriod('1y');
      expect(component.headerPeriod()).toBe('1y');
    });

    it('should default to 6m header period for unknown store periods', () => {
      store.setPeriod('6m');
      expect(component.headerPeriod()).toBe('6m');
    });

    it('should update store period on period change', () => {
      component.onPeriodChange('1m');
      expect(store.filters().period).toBe('30d'); // 1m maps to 30d
    });

    it('should map 3m header period to 30d store period', () => {
      component.onPeriodChange('3m');
      expect(store.filters().period).toBe('30d');
    });

    it('should map 1y header period to 1y store period', () => {
      component.onPeriodChange('1y');
      expect(store.filters().period).toBe('1y');
    });

    it('should map 6m header period to 6m store period', () => {
      component.onPeriodChange('6m');
      expect(store.filters().period).toBe('6m');
    });

    it('should update store bankId on bank change', () => {
      component.onBankChange('santander');
      expect(store.filters().bankId).toBe('santander');
    });

    it('should clear filters on reset', () => {
      store.setBankId('santander');
      store.setPeriod('1y');
      component.onFiltersReset();
      expect(store.filters().bankId).toBeNull();
      expect(store.filters().period).toBe('6m');
    });
  });
});
