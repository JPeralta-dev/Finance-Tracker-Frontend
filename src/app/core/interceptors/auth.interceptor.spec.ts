import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Authorization header when token exists', (done) => {
    // Arrange
    localStorage.setItem('accessToken', 'test-token');

    // Act
    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual({ data: 'test' });
      done();
    });

    // Assert
    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');

    req.flush({ data: 'test' });
  });

  it('should not add header when token is null', (done) => {
    // Arrange - no token
    localStorage.removeItem('accessToken');

    // Act
    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual({ data: 'test' });
      done();
    });

    // Assert
    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBeNull();

    req.flush({ data: 'test' });
  });

  describe('Token Refresh', () => {
    it('should refresh token on 401 and retry the original request', (done) => {
      // Arrange
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      // Act
      httpClient.get('/api/protected').subscribe((response) => {
        expect(response).toEqual({ data: 'success' });
        done();
      });

      // First request gets 401
      const firstReq = httpMock.expectOne('/api/protected');
      expect(firstReq.request.headers.get('Authorization')).toBe('Bearer expired-token');
      firstReq.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // Refresh token request
      const refreshReq = httpMock.expectOne('/api/auth/refresh');
      expect(refreshReq.request.method).toBe('POST');
      refreshReq.flush({ accessToken: 'new-token' });

      // Retry with new token
      const retryReq = httpMock.expectOne('/api/protected');
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
      retryReq.flush({ data: 'success' });
    });

    it('should redirect to login when refresh fails', (done) => {
      // Arrange
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');

      // Act
      httpClient.get('/api/protected').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(navigateSpy).toHaveBeenCalledWith(['/login']);
          expect(localStorage.getItem('accessToken')).toBeNull();
          expect(localStorage.getItem('refreshToken')).toBeNull();
          done();
        },
      });

      // First request gets 401
      const firstReq = httpMock.expectOne('/api/protected');
      firstReq.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // Refresh token request fails
      const refreshReq = httpMock.expectOne('/api/auth/refresh');
      refreshReq.flush({ error: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should queue concurrent requests during refresh and retry with new token', (done) => {
      // Arrange
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      let completed = 0;
      const checkDone = () => {
        completed++;
        if (completed === 2) done();
      };

      // Act — send 2 concurrent requests
      httpClient.get('/api/data-1').subscribe((response) => {
        expect(response).toEqual({ data: 1 });
        checkDone();
      });

      httpClient.get('/api/data-2').subscribe((response) => {
        expect(response).toEqual({ data: 2 });
        checkDone();
      });

      // Both requests get 401
      const req1 = httpMock.expectOne('/api/data-1');
      req1.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const req2 = httpMock.expectOne('/api/data-2');
      req2.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // Only one refresh request should be made
      const refreshReq = httpMock.expectOne('/api/auth/refresh');
      refreshReq.flush({ accessToken: 'new-token' });

      // Both retries should use the new token
      const retry1 = httpMock.expectOne('/api/data-1');
      expect(retry1.request.headers.get('Authorization')).toBe('Bearer new-token');
      retry1.flush({ data: 1 });

      const retry2 = httpMock.expectOne('/api/data-2');
      expect(retry2.request.headers.get('Authorization')).toBe('Bearer new-token');
      retry2.flush({ data: 2 });
    });

    it('should not trigger multiple refreshes when already refreshing', (done) => {
      // Arrange
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');

      let completed = 0;
      const checkDone = () => {
        completed++;
        if (completed === 3) done();
      };

      // Act — send 3 concurrent requests
      httpClient.get('/api/a').subscribe(() => checkDone());
      httpClient.get('/api/b').subscribe(() => checkDone());
      httpClient.get('/api/c').subscribe(() => checkDone());

      // All 3 get 401
      httpMock.expectOne('/api/a').flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/api/b').flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/api/c').flush({}, { status: 401, statusText: 'Unauthorized' });

      // Only ONE refresh should happen
      const refreshReq = httpMock.expectOne('/api/auth/refresh');
      refreshReq.flush({ accessToken: 'fresh-token' });

      // All 3 retries
      httpMock.expectOne('/api/a').flush({});
      httpMock.expectOne('/api/b').flush({});
      httpMock.expectOne('/api/c').flush({});
    });
  });
});
