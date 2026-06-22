import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';

import { premiumGuard } from './premium.guard';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

describe('PremiumGuard', () => {
  let router: Router;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['initAuthCheck', 'isPremium'], {
      isPremium: signal(false),
      authReady$: undefined as any,
    });
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['warning', 'info', 'success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        provideRouter([]),
      ],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  describe('Free user', () => {
    beforeEach(() => {
      (authServiceSpy.isPremium as any).set(false);
      // Mock authReady$ to emit true immediately
      (authServiceSpy as any).authReady$ = {
        pipe: () => ({
          filter: () => ({
            take: () => ({
              map: (fn: (v: boolean) => boolean) => ({
                subscribe: (callbacks: { next: (v: boolean) => void }) => {
                  callbacks.next(true);
                },
              }),
            }),
          }),
        }),
      };
    });

    it('should redirect to /subscription when user is not premium', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        premiumGuard(null as any, null as any);
      });
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/subscription'], {
        queryParams: { upgrade: 'true' },
      });
    }));

    it('should show warning toast for free user', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        premiumGuard(null as any, null as any);
      });
      tick();

      expect(toastServiceSpy.warning).toHaveBeenCalledWith(
        'Función premium',
        'Necesitás una suscripción premium para acceder a esta sección.',
      );
    }));

    it('should return false (block navigation) for free user', fakeAsync(() => {
      let result: unknown;
      TestBed.runInInjectionContext(() => {
        const guardResult = premiumGuard(null as any, null as any);
        // The guard returns an Observable, we need to subscribe
        (guardResult as any).subscribe({
          next: (val: unknown) => { result = val; },
        });
      });
      tick();

      expect(result).toBe(false);
    }));
  });

  describe('Premium user', () => {
    beforeEach(() => {
      (authServiceSpy.isPremium as any).set(true);
      (authServiceSpy as any).authReady$ = {
        pipe: () => ({
          filter: () => ({
            take: () => ({
              map: (fn: (v: boolean) => boolean) => ({
                subscribe: (callbacks: { next: (v: boolean) => void }) => {
                  callbacks.next(true);
                },
              }),
            }),
          }),
        }),
      };
    });

    it('should allow navigation for premium user', fakeAsync(() => {
      let result: unknown;
      TestBed.runInInjectionContext(() => {
        const guardResult = premiumGuard(null as any, null as any);
        (guardResult as any).subscribe({
          next: (val: unknown) => { result = val; },
        });
      });
      tick();

      expect(result).toBe(true);
    }));

    it('should NOT redirect for premium user', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        premiumGuard(null as any, null as any);
      });
      tick();

      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should NOT show toast for premium user', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        premiumGuard(null as any, null as any);
      });
      tick();

      expect(toastServiceSpy.warning).not.toHaveBeenCalled();
    }));
  });

  describe('Premium Plus user', () => {
    beforeEach(() => {
      // Premium Plus is also "premium" (tier !== 'free')
      (authServiceSpy.isPremium as any).set(true);
      (authServiceSpy as any).authReady$ = {
        pipe: () => ({
          filter: () => ({
            take: () => ({
              map: (fn: (v: boolean) => boolean) => ({
                subscribe: (callbacks: { next: (v: boolean) => void }) => {
                  callbacks.next(true);
                },
              }),
            }),
          }),
        }),
      };
    });

    it('should allow navigation for premium_plus user', fakeAsync(() => {
      let result: unknown;
      TestBed.runInInjectionContext(() => {
        const guardResult = premiumGuard(null as any, null as any);
        (guardResult as any).subscribe({
          next: (val: unknown) => { result = val; },
        });
      });
      tick();

      expect(result).toBe(true);
    }));
  });
});
