import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { premiumGuard } from './premium.guard';
import { AuthService } from '../services/auth.service';
import { UpgradeModalService } from '../services/upgrade-modal.service';
import { FtAnalyticsService } from '../services/analytics.service';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';

describe('premiumGuard', () => {
  let authMock: jasmine.SpyObj<AuthService>;
  let upgradeModalMock: jasmine.SpyObj<UpgradeModalService>;
  let analyticsMock: jasmine.SpyObj<FtAnalyticsService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'initAuthCheck',
      'isPremium',
      'subscriptionTier',
      'currentSubscription',
    ], {
      authReady$: new Subject<boolean>(),
    });
    upgradeModalMock = jasmine.createSpyObj<UpgradeModalService>('UpgradeModalService', ['openModal']);
    analyticsMock = jasmine.createSpyObj<FtAnalyticsService>('FtAnalyticsService', ['trackEvent']);
    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

    authMock.isPremium.and.returnValue(false);
    authMock.subscriptionTier.and.returnValue('free');
    authMock.currentSubscription.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: UpgradeModalService, useValue: upgradeModalMock },
        { provide: FtAnalyticsService, useValue: analyticsMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should NOT open the modal for premium users (allow access)', (done) => {
    authMock.isPremium.and.returnValue(true);
    // authReady$ should emit true to unblock the guard
    const subject = authMock.authReady$ as unknown as Subject<boolean>;
    const result$ = TestBed.runInInjectionContext(() =>
      premiumGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/goals' } as RouterStateSnapshot,
      ),
    );
    (result$ as any).subscribe((res: boolean) => {
      expect(res).toBe(true);
      expect(upgradeModalMock.openModal).not.toHaveBeenCalled();
      done();
    });
    subject.next(true);
  });

  it('should open the modal for free users (block access)', (done) => {
    const subject = authMock.authReady$ as unknown as Subject<boolean>;
    const result$ = TestBed.runInInjectionContext(() =>
      premiumGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/insights' } as RouterStateSnapshot,
      ),
    );
    (result$ as any).subscribe((res: boolean) => {
      expect(res).toBe(false);
      expect(upgradeModalMock.openModal).toHaveBeenCalledWith(
        jasmine.objectContaining({
          trigger: 'premium_guard',
          route: '/insights',
        }),
      );
      expect(analyticsMock.trackEvent).toHaveBeenCalledWith(
        'premium_access_attempted',
        jasmine.objectContaining({ route: '/insights' }),
      );
      done();
    });
    subject.next(true);
  });
});
