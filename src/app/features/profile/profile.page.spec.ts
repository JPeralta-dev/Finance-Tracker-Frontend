import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePage, calculateAccountAge } from './profile.page';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { of, throwError } from 'rxjs';
import type { User } from '../../core/models/user.model';
import type { Insight } from '../../core/models/insight.model';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let financeServiceSpy: jasmine.SpyObj<FinanceService>;
  let currencyServiceSpy: jasmine.SpyObj<CurrencyService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: '2024-01-15T00:00:00Z',
  };

  const mockInsights: Insight[] = [
    {
      id: '1',
      type: 'info',
      titleKey: 'insights.spendingTrend',
      messageKey: 'insights.spendingTrendMsg',
      severity: 'low',
    },
    {
      id: '2',
      type: 'warning',
      titleKey: 'insights.budgetAlert',
      messageKey: 'insights.budgetAlertMsg',
      severity: 'medium',
    },
  ];

  const mockTranslationService = {
    translate: (key: string) => key,
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getProfile', 'updateProfile']);
    financeServiceSpy = jasmine.createSpyObj('FinanceService', ['getInsights']);
    currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['format']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: FinanceService, useValue: financeServiceSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    });

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
  });

  describe('Pure functions', () => {
    describe('calculateAccountAge()', () => {
      it('should return "Less than a month" for accounts newer than 1 month', () => {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 15);
        expect(calculateAccountAge(recentDate.toISOString())).toBe('Less than a month');
      });

      it('should return months for accounts less than a year old', () => {
        const fiveMonthsAgo = new Date();
        fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
        expect(calculateAccountAge(fiveMonthsAgo.toISOString())).toBe('5 months');
      });

      it('should return years for accounts older than 12 months', () => {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        expect(calculateAccountAge(twoYearsAgo.toISOString())).toBe('2 years');
      });

      it('should return "1 years" for exactly 12 months', () => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        expect(calculateAccountAge(oneYearAgo.toISOString())).toBe('1 years');
      });
    });
  });

  describe('Data loading', () => {
    it('should start in loading state', () => {
      expect(component.state()).toBe('loading');
    });

    it('should load user profile and insights on init', () => {
      authServiceSpy.getProfile.and.returnValue(of(mockUser));
      financeServiceSpy.getInsights.and.returnValue(of(mockInsights));

      component.ngOnInit();

      expect(component.user()).toEqual(mockUser);
      expect(component.insights()).toEqual(mockInsights);
      expect(component.state()).toBe('ready');
    });

    it('should calculate account age from user createdAt', () => {
      authServiceSpy.getProfile.and.returnValue(of(mockUser));
      financeServiceSpy.getInsights.and.returnValue(of([]));

      component.ngOnInit();

      expect(component.userStats()).toBeTruthy();
      expect(component.userStats()!.accountAge).toBeTruthy();
    });

    it('should handle insights fetch failure gracefully', () => {
      authServiceSpy.getProfile.and.returnValue(of(mockUser));
      financeServiceSpy.getInsights.and.returnValue(throwError(() => new Error('fail')));

      component.ngOnInit();

      expect(component.user()).toEqual(mockUser);
      expect(component.insights()).toEqual([]);
      expect(component.state()).toBe('ready');
    });

    it('should handle profile fetch failure', () => {
      authServiceSpy.getProfile.and.returnValue(throwError(() => new Error('fail')));
      financeServiceSpy.getInsights.and.returnValue(of([]));

      component.ngOnInit();

      expect(component.state()).toBe('error');
    });

    it('should set empty insights when insights service returns empty array', () => {
      authServiceSpy.getProfile.and.returnValue(of(mockUser));
      financeServiceSpy.getInsights.and.returnValue(of([]));

      component.ngOnInit();

      expect(component.insights()).toEqual([]);
      expect(component.state()).toBe('ready');
    });
  });

  describe('Form submission', () => {
    it('should call updateProfile with display name on submit', () => {
      authServiceSpy.getProfile.and.returnValue(of(mockUser));
      financeServiceSpy.getInsights.and.returnValue(of([]));
      authServiceSpy.updateProfile.and.returnValue(of(mockUser));

      component.ngOnInit();
      component.profileForm.patchValue({ displayName: 'New Name' });
      component.onSubmit();

      expect(authServiceSpy.updateProfile).toHaveBeenCalledWith('New Name');
    });

    it('should show success toast on successful update', () => {
      authServiceSpy.getProfile.and.returnValue(of(mockUser));
      financeServiceSpy.getInsights.and.returnValue(of([]));
      authServiceSpy.updateProfile.and.returnValue(of(mockUser));

      component.ngOnInit();
      component.profileForm.patchValue({ displayName: 'New Name' });
      component.onSubmit();

      expect(toastServiceSpy.success).toHaveBeenCalled();
    });
  });
});
