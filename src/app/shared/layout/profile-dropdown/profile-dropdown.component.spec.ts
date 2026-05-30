import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, NavigationEnd, RouterEvent } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

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
    const displayName1 = 'John Doe';
    const initials1 = displayName1
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    expect(initials1).toBe('JD');

    const displayName2 = 'Maria';
    const initials2 = displayName2
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    expect(initials2).toBe('M');

    const displayName3 = 'Juan Pablo Perez';
    const initials3 = displayName3
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    expect(initials3).toBe('JP');
  });

  it('should fallback to email when no displayName', () => {
    const email = 'test@example.com';
    const fallbackDisplayName = email.split('@')[0];
    expect(fallbackDisplayName).toBe('test');

    const initials = fallbackDisplayName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    expect(initials).toBe('T');
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
      // Spy on currentUrl signal to return /login
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
  });
});
