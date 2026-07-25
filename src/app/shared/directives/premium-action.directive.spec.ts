import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FtPremiumActionDirective } from './premium-action.directive';
import { AuthService } from '../../core/services/auth.service';
import { UpgradeModalService } from '../../core/services/upgrade-modal.service';
import { FtAnalyticsService } from '../../core/services/analytics.service';

@Component({
  standalone: true,
  imports: [FtPremiumActionDirective],
  template: `
    <button
      ftPremiumAction
      [ftPremiumActionFeature]="feature"
      [ftPremiumActionRoute]="route"
      (click)="clicked = true"
    >Go</button>
  `,
})
class TestHost {
  feature = 'create-goal';
  route = '/subscription';
  clicked = false;
}

describe('FtPremiumActionDirective', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let authMock: { isPremium: ReturnType<typeof signal> };
  let upgradeModalMock: jasmine.SpyObj<UpgradeModalService>;
  let analyticsMock: jasmine.SpyObj<FtAnalyticsService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authMock = { isPremium: signal(false) };
    upgradeModalMock = jasmine.createSpyObj<UpgradeModalService>('UpgradeModalService', ['openModal']);
    analyticsMock = jasmine.createSpyObj<FtAnalyticsService>('FtAnalyticsService', ['trackEvent']);
    routerMock = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: UpgradeModalService, useValue: upgradeModalMock },
        { provide: FtAnalyticsService, useValue: analyticsMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open upgrade modal for free users and prevent click', () => {
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(upgradeModalMock.openModal).toHaveBeenCalledWith(
      jasmine.objectContaining({ feature: undefined, trigger: 'direct_link' }),
    );
    expect(analyticsMock.trackEvent).toHaveBeenCalledWith('premium_feature_attempted', jasmine.any(Object));
    // The (click) handler should NOT have run because we preventDefault'd.
    expect(host.clicked).toBe(false);
  });

  it('should allow click for premium users (no modal)', () => {
    authMock.isPremium.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(upgradeModalMock.openModal).not.toHaveBeenCalled();
  });
});
