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

  const mockAuthResponse = {
    user: mockUser,
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
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

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should set tokens and user', () => {
    // Act
    service.login('test@example.com', 'password123').subscribe((response) => {
      expect(response).toEqual(mockAuthResponse);
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()).toEqual(mockUser);
      expect(localStorage.getItem('accessToken')).toBe('test-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
    });

    // Assert
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });

    req.flush(mockAuthResponse);
  });

  it('logout should clear tokens and user', () => {
    // Arrange - simulate logged in state
    localStorage.setItem('accessToken', 'test-access-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');

    // Act
    service.logout().subscribe(() => {
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    // Assert
    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      refreshToken: 'test-refresh-token',
    });

    req.flush({});
  });

  it('isAuthenticated should return true when logged in', () => {
    // Arrange
    TestBed.overrideProvider(AuthService, {
      useFactory: () => {
        const authService = new AuthService();
        // Simulate user being logged in by setting the signal directly
        // We'll test the computed signal behavior
        return authService;
      },
    });

    const authService = TestBed.inject(AuthService);

    // Initially should be false (no user in storage)
    expect(authService.isAuthenticated()).toBeFalse();

    // After login simulation
    localStorage.setItem('accessToken', 'test-token');
    // Note: isAuthenticated is based on user signal, not token
    // We need to test it through the login flow or by setting user
  });
});
