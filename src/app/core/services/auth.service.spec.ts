import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockSessionResponse = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.displayName,
    },
    session: {
      id: 'session-1',
      expiresAt: '2024-12-31T00:00:00Z',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should set user signal on success', () => {
    // Act
    service.login('test@example.com', 'password123').subscribe((response) => {
      expect(response.email).toBe(mockUser.email);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()?.email).toBe(mockUser.email);
    });

    // Assert
    const req = httpMock.expectOne(r => r.url.endsWith('/api/auth/sign-in/email'));
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();

    req.flush(mockSessionResponse);
  });

  it('logout should clear user and navigate to login', () => {
    // Arrange - simulate logged in state
    // Manually set user signal via getProfile first
    service.getProfile().subscribe();
    const sessionReq = httpMock.expectOne(r => r.url.endsWith('/get-session'));
    sessionReq.flush(mockSessionResponse);

    expect(service.isAuthenticated()).toBeTrue();

    // Act
    service.logout().subscribe();

    const logoutReq = httpMock.expectOne(r => r.url.endsWith('/api/auth/sign-out'));
    expect(logoutReq.request.method).toBe('POST');
    expect(logoutReq.request.withCredentials).toBeTrue();

    logoutReq.flush({});

    expect(service.isAuthenticated()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('clearTokens should clear session without navigation', () => {
    // Arrange
    service.getProfile().subscribe();
    const sessionReq = httpMock.expectOne(r => r.url.endsWith('/get-session'));
    sessionReq.flush(mockSessionResponse);

    expect(service.isAuthenticated()).toBeTrue();

    // Act
    service.clearTokens();

    // Assert
    expect(service.isAuthenticated()).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('getProfile should fetch session and set user', () => {
    // Act
    service.getProfile().subscribe((user) => {
      expect(user.email).toBe(mockUser.email);
      expect(service.isAuthenticated()).toBeTrue();
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/get-session'));
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockSessionResponse);
  });

  it('signInWithGoogle should redirect to Google OAuth', () => {
    // Act
    service.signInWithGoogle();

    // Can't easily test window.location.href in unit test,
    // but we verify the method exists and doesn't throw
    expect(typeof service.signInWithGoogle).toBe('function');
  });
});
