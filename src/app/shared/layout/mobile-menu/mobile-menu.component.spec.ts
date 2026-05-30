import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MobileMenuComponent } from './mobile-menu.component';
import { AuthService } from '../../../core/services/auth.service';

describe('MobileMenuComponent', () => {
  let component: MobileMenuComponent;
  let fixture: ComponentFixture<MobileMenuComponent>;
  let router: Router;

  const mockAuthService = {
    currentUser: jasmine.createSpy('currentUser').and.returnValue(null),
    logout: jasmine.createSpy('logout'),
    clearTokens: jasmine.createSpy('clearTokens'),
  };

  beforeEach(async () => {
    mockAuthService.logout.calls.reset();
    mockAuthService.clearTokens.calls.reset();

    await TestBed.configureTestingModule({
      imports: [MobileMenuComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileMenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close when onClose is called', () => {
    let emitted = false;
    component.close.subscribe(() => { emitted = true; });

    component.onClose();

    expect(emitted).toBeTrue();
  });

  describe('logout navigation', () => {
    it('should navigate to /login on successful logout', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(of(null));

      component.onLogout();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should navigate to /login on logout error', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(throwError(() => new Error('logout failed')));

      component.onLogout();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should call onClose after logout', fakeAsync(() => {
      mockAuthService.logout.and.returnValue(of(null));
      let emitted = false;
      component.close.subscribe(() => { emitted = true; });

      component.onLogout();
      tick();

      expect(emitted).toBeTrue();
    }));
  });
});
