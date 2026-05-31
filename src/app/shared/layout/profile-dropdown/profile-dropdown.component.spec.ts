import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProfileDropdownComponent } from './profile-dropdown.component';
import { AuthService } from '../../../core/services/auth.service';

describe('ProfileDropdownComponent', () => {
  let component: ProfileDropdownComponent;
  let fixture: ComponentFixture<ProfileDropdownComponent>;
  let router: Router;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    displayName: 'John Doe',
  };

  const mockAuthService = {
    currentUser: jasmine.createSpy('currentUser').and.returnValue(mockUser),
    logout: jasmine.createSpy('logout'),
    clearTokens: jasmine.createSpy('clearTokens'),
  };

  beforeEach(async () => {
    mockAuthService.logout.calls.reset();
    mockAuthService.clearTokens.calls.reset();

    await TestBed.configureTestingModule({
      imports: [ProfileDropdownComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDropdownComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate initials from displayName', () => {
    expect(component.initials()).toBe('JD');
  });

  it('should fallback to email when no displayName', () => {
    const userWithoutName = {
      id: '2',
      email: 'test@example.com',
    };
    (mockAuthService.currentUser as jasmine.Spy).and.returnValue(userWithoutName);
    fixture.detectChanges();
    expect(component.initials()).toBe('T');
  });

  it('should toggle dropdown open state', () => {
    expect(component.isOpen()).toBeFalse();
    component.toggleDropdown();
    expect(component.isOpen()).toBeTrue();
    component.toggleDropdown();
    expect(component.isOpen()).toBeFalse();
  });

  it('should close dropdown', () => {
    component.isOpen.set(true);
    component.closeDropdown();
    expect(component.isOpen()).toBeFalse();
  });

  describe('logout navigation', () => {
    it('should navigate to /login on successful logout when not on login page', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(of(null));

      component.onLogout();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should NOT navigate to /login when already on /login page', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(of(null));
      spyOn(component as any, 'currentUrl').and.returnValue({ urlAfterRedirects: '/login' } as any);

      component.onLogout();
      tick();

      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should navigate to /login on logout error when not on login page', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(throwError(() => new Error('logout failed')));

      component.onLogout();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockAuthService.clearTokens).toHaveBeenCalled();
    }));

    it('should prevent double logout via isLoggingOut guard', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(of(null));

      component.onLogout();
      component.onLogout(); // second call should be ignored
      tick();

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    }));
  });
});
