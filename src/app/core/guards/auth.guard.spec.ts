import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { authGuard } from './auth.guard';

describe('AuthGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });

    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should allow activation when authenticated', () => {
    // Arrange
    localStorage.setItem('accessToken', 'valid-token');

    // Act
    const result = authGuard(null as any, null as any);

    // Assert
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    // Arrange - no token in localStorage
    localStorage.removeItem('accessToken');
    spyOn(router, 'navigate');

    // Act
    const result = authGuard(null as any, null as any);

    // Assert
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
