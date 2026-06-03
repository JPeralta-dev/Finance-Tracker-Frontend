import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BlendyService } from './blendy.service';

describe('BlendyService', () => {
  let service: BlendyService;

  beforeEach(() => {
    // Mock matchMedia to return false (no reduced motion)
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
    } as unknown as MediaQueryList);

    TestBed.configureTestingModule({
      providers: [BlendyService],
    });

    service = TestBed.inject(BlendyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('prefersReducedMotion', () => {
    it('should initialize to false when prefers-reduced-motion is not set', () => {
      expect(service.prefersReducedMotion()).toBe(false);
    });

    it('should be settable to true (simulating reduced motion detection)', () => {
      // The service detects reduced motion via matchMedia in afterNextRender.
      // In tests, we verify the signal can be set and affects behavior.
      (service as any).prefersReducedMotion.set(true);
      expect(service.prefersReducedMotion()).toBe(true);
    });
  });

  describe('toggle()', () => {
    it('should not throw when called (blendy may not be initialized in tests)', () => {
      // In test environment, afterNextRender may not fully initialize blendy
      // The service should handle this gracefully with optional chaining
      expect(() => service.toggle('test-id')).not.toThrow();
    });

    it('should be a no-op when prefersReducedMotion is true', () => {
      // Manually set reduced motion
      (service as any).prefersReducedMotion.set(true);
      expect(() => service.toggle('test-id')).not.toThrow();
      expect(service.prefersReducedMotion()).toBe(true);
    });
  });

  describe('untoggle()', () => {
    it('should call callback immediately when prefersReducedMotion is true', () => {
      (service as any).prefersReducedMotion.set(true);
      const callback = jasmine.createSpy('callback');

      service.untoggle('test-id', callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not throw when called without reduced motion', () => {
      const callback = jasmine.createSpy('callback');

      expect(() => service.untoggle('test-id', callback)).not.toThrow();
      // Callback should NOT be called immediately (it fires after animation)
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should not throw when called', () => {
      expect(() => service.update()).not.toThrow();
    });
  });
});
