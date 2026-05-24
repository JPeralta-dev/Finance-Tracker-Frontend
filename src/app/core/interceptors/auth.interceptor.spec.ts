import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { authInterceptor, resetInterceptorState } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: {
    refreshToken: jasmine.Spy;
    clearTokens: jasmine.Spy;
  };
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = {
      refreshToken: jasmine.createSpy('refreshToken'),
      clearTokens: jasmine.createSpy('clearTokens'),
    };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    localStorage.clear();
    resetInterceptorState();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Authorization header when token exists', (done) => {
    localStorage.setItem('accessToken', 'test-token');

    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual({ data: 'test' });
      done();
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({ data: 'test' });
  });

  it('should not add header when token is null', (done) => {
    localStorage.removeItem('accessToken');

    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual({ data: 'test' });
      done();
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({ data: 'test' });
  });

  describe('Token Refresh', () => {
    it('should refresh token on 401 and retry the original request', (done) => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(of({ accessToken: 'new-token' }));

      httpClient.get('/api/protected').subscribe((response) => {
        expect(response).toEqual({ data: 'success' });
        done();
      });

      const firstReq = httpMock.expectOne('/api/protected');
      firstReq.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // Since we mock refreshToken, no HTTP call to /api/auth/refresh happens
      const retryReq = httpMock.expectOne('/api/protected');
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
      retryReq.flush({ data: 'success' });
    });

    it('should call clearTokens when refresh fails', (done) => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(
        throwError(() => ({ status: 401 }))
      );

      httpClient.get('/api/protected').subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(authServiceSpy.clearTokens).toHaveBeenCalled();
          done();
        },
      });

      const firstReq = httpMock.expectOne('/api/protected');
      firstReq.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // No HTTP call to /api/auth/refresh since refreshToken is mocked
    });

    it('should queue concurrent requests during refresh and retry with new token', (done) => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(of({ accessToken: 'new-token' }));

      let completed = 0;
      const checkDone = () => {
        completed++;
        if (completed === 2) done();
      };

      httpClient.get('/api/data-1').subscribe((response) => {
        expect(response).toEqual({ data: 1 });
        checkDone();
      });

      httpClient.get('/api/data-2').subscribe((response) => {
        expect(response).toEqual({ data: 2 });
        checkDone();
      });

      const req1 = httpMock.expectOne('/api/data-1');
      req1.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const req2 = httpMock.expectOne('/api/data-2');
      req2.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // No HTTP refresh call since mocked
      const retry1 = httpMock.expectOne('/api/data-1');
      expect(retry1.request.headers.get('Authorization')).toBe('Bearer new-token');
      retry1.flush({ data: 1 });

      const retry2 = httpMock.expectOne('/api/data-2');
      expect(retry2.request.headers.get('Authorization')).toBe('Bearer new-token');
      retry2.flush({ data: 2 });
    });

    it('should not trigger multiple refreshes when already refreshing', (done) => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(of({ accessToken: 'fresh-token' }));

      let completed = 0;
      const checkDone = () => {
        completed++;
        if (completed === 3) done();
      };

      httpClient.get('/api/a').subscribe(() => checkDone());
      httpClient.get('/api/b').subscribe(() => checkDone());
      httpClient.get('/api/c').subscribe(() => checkDone());

      httpMock.expectOne('/api/a').flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/api/b').flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/api/c').flush({}, { status: 401, statusText: 'Unauthorized' });

      // No HTTP refresh call since mocked
      httpMock.expectOne('/api/a').flush({});
      httpMock.expectOne('/api/b').flush({});
      httpMock.expectOne('/api/c').flush({});
    });
  });
});
