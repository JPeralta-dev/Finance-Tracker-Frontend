import { TestBed } from '@angular/core/testing';
import { FtTourService } from './tour.service';
import { FtAnalyticsService } from './analytics.service';

describe('FtTourService', () => {
  let service: FtTourService;
  let analyticsMock: jasmine.SpyObj<FtAnalyticsService>;

  beforeEach(() => {
    localStorage.clear();
    analyticsMock = jasmine.createSpyObj<FtAnalyticsService>('FtAnalyticsService', ['trackEvent']);
    TestBed.configureTestingModule({
      providers: [
        { provide: FtAnalyticsService, useValue: analyticsMock },
      ],
    });
    service = TestBed.inject(FtTourService);
  });

  it('should expose 5 onboarding steps', () => {
    expect(service.totalSteps).toBe(5);
    expect(service.steps.length).toBe(5);
  });

  it('should not be active by default', () => {
    expect(service.isActive()).toBe(false);
    expect(service.shouldPromptForTour()).toBe(true);
  });

  it('should start the tour at step 1 and fire analytics', () => {
    service.start();
    expect(service.isActive()).toBe(true);
    expect(service.currentStepNumber()).toBe(1);
    expect(analyticsMock.trackEvent).toHaveBeenCalledWith(
      'onboarding_tour_started',
      jasmine.objectContaining({ step: 1 }),
    );
  });

  it('should advance to the next step on next()', () => {
    service.start();
    service.next();
    expect(service.currentStepNumber()).toBe(2);
    expect(analyticsMock.trackEvent).toHaveBeenCalledWith(
      'onboarding_tour_step_viewed',
      jasmine.objectContaining({ step: 2 }),
    );
  });

  it('should go back on previous() but not below 1', () => {
    service.start();
    service.next();
    service.previous();
    expect(service.currentStepNumber()).toBe(1);
    service.previous();
    expect(service.currentStepNumber()).toBe(1); // clamped
  });

  it('should complete on next() from the last step', () => {
    service.start();
    for (let i = 0; i < 4; i++) service.next();
    expect(service.currentStepNumber()).toBe(5);
    service.next();
    expect(service.isActive()).toBe(false);
    expect(analyticsMock.trackEvent).toHaveBeenCalledWith('onboarding_tour_completed', jasmine.any(Object));
    expect(service.tourState().status).toBe('completed');
  });

  it('should skip and persist skipped state', () => {
    service.start();
    service.next();
    service.skip();
    expect(service.isActive()).toBe(false);
    expect(service.tourState().status).toBe('skipped');
    expect(service.hasFinishedTour()).toBe(true);
  });

  it('should resume from the last step on start() when status is in_progress', () => {
    service.start();
    service.next();
    service.next();
    service.stop();
    // New service instance to force re-hydration from localStorage
    const fresh = TestBed.inject(FtTourService);
    fresh.start();
    expect(fresh.currentStepNumber()).toBe(3);
  });

  it('should reset on resetTour()', () => {
    service.start();
    service.skip();
    service.resetTour();
    expect(service.tourState().status).toBe('not_started');
    expect(service.hasFinishedTour()).toBe(false);
  });
});
