import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { GoalsWidgetComponent } from './goals-widget.component';
import { GoalsService } from '../../../../core/services/goals.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Goal } from '../../../../core/models/goal.model';

describe('GoalsWidgetComponent', () => {
  let component: GoalsWidgetComponent;
  let fixture: ComponentFixture<GoalsWidgetComponent>;
  let goalsServiceSpy: jasmine.SpyObj<GoalsService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  const makeGoal = (id: string, name: string, current: number, target: number, status: Goal['status'] = 'active'): Goal => ({
    id,
    userId: 'user-1',
    name,
    targetAmount: target,
    currentAmount: current,
    deadline: '2025-12-31',
    status,
    createdAt: '2024-01-01T00:00:00Z',
  });

  beforeEach(() => {
    goalsServiceSpy = jasmine.createSpyObj('GoalsService', ['getGoals']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['initAuthCheck', 'isPremium'], {
      isPremium: signal(false),
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warning', 'info', 'success', 'error']);

    TestBed.configureTestingModule({
      imports: [GoalsWidgetComponent],
      providers: [
        { provide: GoalsService, useValue: goalsServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideRouter([]),
      ],
    });

    fixture = TestBed.createComponent(GoalsWidgetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Free user (not premium)', () => {
    beforeEach(() => {
      (authServiceSpy.isPremium as any).set(false);
    });

    it('should show ready state without loading goals', () => {
      component.ngOnInit();
      expect(component.state()).toBe('ready');
      expect(goalsServiceSpy.getGoals).not.toHaveBeenCalled();
    });

    it('should display upgrade prompt (free user gating)', () => {
      component.ngOnInit();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const upgradeSection = compiled.querySelector('.goals-widget__upgrade');
      expect(upgradeSection).toBeTruthy();
    });
  });

  describe('Premium user', () => {
    beforeEach(() => {
      (authServiceSpy.isPremium as any).set(true);
    });

    it('should load goals on init for premium user', () => {
      goalsServiceSpy.getGoals.and.returnValue(of([]));

      component.ngOnInit();

      expect(goalsServiceSpy.getGoals).toHaveBeenCalled();
    });

    it('should show loading skeleton state', () => {
      goalsServiceSpy.getGoals.and.returnValue(of([]));

      component.ngOnInit();
      expect(component.state()).toBe('loading');
    });

    it('should show ready state with goals data', fakeAsync(() => {
      const mockGoals: Goal[] = [
        makeGoal('1', 'Emergency Fund', 500_000, 1_000_000),
        makeGoal('2', 'Vacation', 200_000, 800_000),
      ];
      goalsServiceSpy.getGoals.and.returnValue(of(mockGoals));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('ready');
    }));

    it('should show empty state when no goals', fakeAsync(() => {
      goalsServiceSpy.getGoals.and.returnValue(of([]));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('empty');
    }));

    it('should show error state on HTTP failure', fakeAsync(() => {
      goalsServiceSpy.getGoals.and.returnValue(throwError(() => new Error('Network error')));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.state()).toBe('error');
    }));

    it('should limit display to top 3 goals', fakeAsync(() => {
      const mockGoals: Goal[] = [
        makeGoal('1', 'Goal 1', 100, 1000),
        makeGoal('2', 'Goal 2', 200, 1000),
        makeGoal('3', 'Goal 3', 300, 1000),
        makeGoal('4', 'Goal 4', 400, 1000),
        makeGoal('5', 'Goal 5', 500, 1000),
      ];
      goalsServiceSpy.getGoals.and.returnValue(of(mockGoals));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.displayGoals().length).toBe(3);
    }));

    it('should filter out non-active goals', fakeAsync(() => {
      const mockGoals: Goal[] = [
        makeGoal('1', 'Active Goal', 500_000, 1_000_000, 'active'),
        makeGoal('2', 'Achieved Goal', 1_000_000, 1_000_000, 'achieved'),
        makeGoal('3', 'Another Active', 200_000, 800_000, 'active'),
      ];
      goalsServiceSpy.getGoals.and.returnValue(of(mockGoals));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      // Only active goals should be displayed
      expect(component.displayGoals().length).toBe(2);
      expect(component.displayGoals()[0].name).toBe('Active Goal');
    }));

    it('should calculate progress percentage correctly', () => {
      const goal = makeGoal('1', 'Test', 500_000, 1_000_000);
      expect(component.progress(goal)).toBe(50);
    });

    it('should cap progress at 100%', () => {
      const goal = makeGoal('1', 'Test', 1_500_000, 1_000_000);
      expect(component.progress(goal)).toBe(100);
    });

    it('should calculate remaining amount', () => {
      const goal = makeGoal('1', 'Test', 300_000, 1_000_000);
      expect(component.remaining(goal)).toBe(700_000);
    });

    it('should render goals in the DOM', fakeAsync(() => {
      const mockGoals: Goal[] = [makeGoal('1', 'Emergency Fund', 500_000, 1_000_000)];
      goalsServiceSpy.getGoals.and.returnValue(of(mockGoals));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const goalRows = compiled.querySelectorAll('.goal-row');
      expect(goalRows.length).toBeGreaterThan(0);
    }));
  });
});
