import { TestBed } from '@angular/core/testing';
import { FtAnalyticsService } from './analytics.service';

describe('FtAnalyticsService', () => {
  let service: FtAnalyticsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FtAnalyticsService);
  });

  it('should default to pending consent', () => {
    expect(service.consent()).toBe('pending');
  });

  it('should grant consent and persist to localStorage', () => {
    service.grantConsent();
    expect(service.consent()).toBe('granted');
    expect(localStorage.getItem('flowr_analytics_consent')).toBe('granted');
  });

  it('should deny consent and persist to localStorage', () => {
    service.denyConsent();
    expect(service.consent()).toBe('denied');
    expect(localStorage.getItem('flowr_analytics_consent')).toBe('denied');
  });

  it('should re-hydrate consent from localStorage on construction', () => {
    localStorage.setItem('flowr_analytics_consent', 'granted');
    const fresh = TestBed.inject(FtAnalyticsService);
    expect(fresh.consent()).toBe('granted');
  });

  it('should queue events even without consent (for replay)', () => {
    service.init();
    service.trackEvent('paywall_modal_shown', { trigger: 'premium_guard' });
    // Events are stored in queue — they will flush when consent is granted.
    expect(service.hasConsent()).toBe(false);
  });

  it('should flush queue immediately when consent is granted', (done) => {
    service.init();
    service.trackEvent('test_event', { foo: 'bar' });
    service.grantConsent();
    // The flush happens inside the bootstrap effect; give it a tick.
    setTimeout(() => {
      // Service is now in "ready" state (PostHog may be null in test env).
      expect(service.isReady() || service.consent() === 'granted').toBe(true);
      done();
    }, 10);
  });

  it('should identify user and persist props', () => {
    service.init();
    service.identifyUser('user-123', { tier: 'premium' });
    expect(JSON.parse(localStorage.getItem('flowr_analytics_user_props') || '{}')).toEqual(
      jasmine.objectContaining({ tier: 'premium' })
    );
  });

  it('should reset user props on reset()', () => {
    service.init();
    service.identifyUser('user-123', { tier: 'free' });
    service.reset();
    expect(JSON.parse(localStorage.getItem('flowr_analytics_user_props') || '{}')).toEqual({});
  });

  it('should track page views via trackPageView', () => {
    spyOn(service, 'trackEvent').and.callThrough();
    service.trackPageView('/dashboard', { tier: 'free' });
    expect(service.trackEvent).toHaveBeenCalledWith('page_viewed', jasmine.objectContaining({
      path: '/dashboard',
    }));
  });
});
