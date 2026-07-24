import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FtTrialBannerService } from './trial-banner.service';
import { AuthService } from './auth.service';

describe('FtTrialBannerService', () => {
  let service: FtTrialBannerService;
  let authMock: { currentSubscription: ReturnType<typeof signal> };

  beforeEach(() => {
    localStorage.clear();
    authMock = {
      currentSubscription: signal<any>(null),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
      ],
    });
    service = TestBed.inject(FtTrialBannerService);
  });

  function setSub(overrides: Record<string, any>) {
    authMock.currentSubscription.set({ status: 'no_trial', ...overrides });
  }

  it('should be hidden when there is no subscription', () => {
    expect(service.isVisible()).toBe(false);
  });

  it('should be visible for active_trial subscription with future end date', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    setSub({ status: 'active_trial', trialEnd: future });
    expect(service.isVisible()).toBe(true);
    expect(service.daysRemaining()).toBe(5);
  });

  it('should pick "info" variant for 3+ days remaining', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    setSub({ status: 'active_trial', trialEnd: future });
    expect(service.variant()).toBe('info');
  });

  it('should pick "warning" variant for 1-2 days remaining', () => {
    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    setSub({ status: 'active_trial', trialEnd: future });
    expect(service.variant()).toBe('warning');
  });

  it('should pick "error" variant for less than 1 day remaining', () => {
    const future = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    setSub({ status: 'active_trial', trialEnd: future });
    expect(service.variant()).toBe('error');
  });

  it('should hide after dismissal (within 24h)', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    setSub({ status: 'active_trial', trialEnd: future });
    expect(service.isVisible()).toBe(true);
    service.dismiss();
    expect(service.isVisible()).toBe(false);
  });

  it('should reappear after 24h if trial still active', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    setSub({ status: 'active_trial', trialEnd: future });
    service.dismiss();
    // Simulate 25h passing by manipulating dismissedAt directly via the signal
    (service.dismissedAt as any).set(Date.now() - 25 * 60 * 60 * 1000);
    expect(service.isVisible()).toBe(true);
  });

  it('should be hidden for premium_active users', () => {
    setSub({ status: 'premium_active', trialEnd: null });
    expect(service.isVisible()).toBe(false);
  });

  it('should be hidden when trial has expired', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    setSub({ status: 'active_trial', trialEnd: past });
    expect(service.isVisible()).toBe(false);
  });
});
