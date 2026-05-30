import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';

import { redirectIfAuthGuard } from './redirect-if-auth.guard';
import { AuthService } from '../services/auth.service';

describe('RedirectIfAuthGuard', () => {
  let router: Router;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: signal(false),
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow activation when authService.isAuthenticated() is false (not logged in)', fakeAsync(() => {
    // Arrange
    (authServiceSpy.isAuthenticated as any).set(false);

    // Act
    TestBed.runInInjectionContext(() => {
      redirectIfAuthGuard(null as any, null as any);
    });
    tick();

    // Assert
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should redirect to dashboard when authService.isAuthenticated() is true (logged in)', fakeAsync(() => {
    // Arrange
    (authServiceSpy.isAuthenticated as any).set(true);

    // Act
    TestBed.runInInjectionContext(() => {
      redirectIfAuthGuard(null as any, null as any);
    });
    tick();

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should allow access to login page when no token exists', fakeAsync(() => {
    // Arrange — no token, isAuthenticated defaults to false

    // Act
    TestBed.runInInjectionContext(() => {
      redirectIfAuthGuard(null as any, null as any);
    });
    tick();

    // Assert
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
