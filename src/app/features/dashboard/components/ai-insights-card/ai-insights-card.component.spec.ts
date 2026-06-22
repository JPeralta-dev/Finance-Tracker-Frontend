import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { AiInsightsCardComponent } from './ai-insights-card.component';
import { FinanceService } from '../../../../core/services/finance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Insight } from '../../../../core/models/insight.model';

describe('AiInsightsCardComponent', () => {
  let component: AiInsightsCardComponent;
  let fixture: ComponentFixture<AiInsightsCardComponent>;
  let financeServiceSpy: jasmine.SpyObj<FinanceService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const makeInsight = (id: string, type: Insight['type']): Insight => ({
    id,
    type,
    titleKey: `Title ${id}`,
    messageKey: `Message ${id}`,
    severity: 'low',
  });

  beforeEach(() => {
    financeServiceSpy = jasmine.createSpyObj('FinanceService', ['getInsights']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['initAuthCheck', 'isPremium'], {
      isPremium: signal(false),
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warning', 'info', 'success', 'error']);

    TestBed.configureTestingModule({
      imports: [AiInsightsCardComponent],
      providers: [
        { provide: FinanceService, useValue: financeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideRouter([]),
      ],
    });

    fixture = TestBed.createComponent(AiInsightsCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Free user (not premium)', () => {
    beforeEach(() => {
      (authServiceSpy.isPremium as any).set(false);
    });

    it('should show ready state without loading insights', () => {
      component.ngOnInit();
      expect(component.state()).toBe('ready');
      expect(financeServiceSpy.getInsights).not.toHaveBeenCalled();
    });

    it('should display upgrade prompt (free user gating)', () => {
      component.ngOnInit();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      // Free user should see the upgrade overlay
      const upgradeSection = compiled.querySelector('.insights-card__upgrade');
      expect(upgradeSection).toBeTruthy();
    });
  });

  describe('Premium user', () => {
    beforeEach(() => {
      (authServiceSpy.isPremium as any).set(true);
    });

    it('should load insights on init for premium user', () => {
      const mockInsights: Insight[] = [
        makeInsight('1', 'warning'),
        makeInsight('2', 'info'),
      ];
      financeServiceSpy.getInsights.and.returnValue(of(mockInsights));

      component.ngOnInit();

      expect(financeServiceSpy.getInsights).toHaveBeenCalled();
    });

    it('should show loading skeleton state', () => {
      financeServiceSpy.getInsights.and.returnValue(of([]));

      component.ngOnInit();
      // State starts as 'loading' before the observable resolves
      expect(component.state()).toBe('loading');
    });

    it('should show ready state with insights data', fakeAsync(() => {
      const mockInsights: Insight[] = [
        makeInsight('1', 'warning'),
        makeInsight('2', 'info'),
        makeInsight('3', 'success'),
      ];
      financeServiceSpy.getInsights.and.returnValue(of(mockInsights));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('ready');
      expect(component.insights()).toEqual(mockInsights);
    }));

    it('should show empty state when no insights', fakeAsync(() => {
      financeServiceSpy.getInsights.and.returnValue(of([]));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('empty');
    }));

    it('should show error state on HTTP failure', fakeAsync(() => {
      financeServiceSpy.getInsights.and.returnValue(throwError(() => new Error('Network error')));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('error');
    }));

    it('should limit display to top 3 insights', fakeAsync(() => {
      const mockInsights: Insight[] = [
        makeInsight('1', 'warning'),
        makeInsight('2', 'info'),
        makeInsight('3', 'success'),
        makeInsight('4', 'trend'),
        makeInsight('5', 'warning'),
      ];
      financeServiceSpy.getInsights.and.returnValue(of(mockInsights));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.displayInsights().length).toBe(3);
      expect(component.displayInsights()[0].id).toBe('1');
      expect(component.displayInsights()[2].id).toBe('3');
    }));

    it('should render insights in the DOM', fakeAsync(() => {
      const mockInsights: Insight[] = [makeInsight('1', 'warning')];
      financeServiceSpy.getInsights.and.returnValue(of(mockInsights));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const insightRows = compiled.querySelectorAll('.insight-row');
      expect(insightRows.length).toBeGreaterThan(0);
    }));
  });
});
