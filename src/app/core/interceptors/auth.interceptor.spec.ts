import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError, lastValueFrom } from 'rxjs';

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
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
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

  it('should add Authorization header when token exists', async () => {
    localStorage.setItem('accessToken', 'test-token');

    const responsePromise = lastValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({ data: 'test' });

    const response = await responsePromise;
    expect(response).toEqual({ data: 'test' });
  });

  it('should not add header when token is null', async () => {
    localStorage.removeItem('accessToken');

    const responsePromise = lastValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({ data: 'test' });

    const response = await responsePromise;
    expect(response).toEqual({ data: 'test' });
  });

  describe('Token Refresh', () => {
    it('should refresh token on 401 and retry the original request', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(of({ accessToken: 'new-token' }));

      const responsePromise = lastValueFrom(httpClient.get('/api/protected'));

      const firstReq = httpMock.expectOne('/api/protected');
      firstReq.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const retryReq = httpMock.expectOne('/api/protected');
      expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
      retryReq.flush({ data: 'success' });

      const response = await responsePromise;
      expect(response).toEqual({ data: 'success' });
    });

    it('should call clearTokens and navigate when refresh fails', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'invalid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(
        throwError(() => new Error('refresh failed'))
      );

      let capturedError: any;
      httpClient.get('/api/protected').subscribe({
        error: (error) => { capturedError = error; },
      });

      const req = httpMock.expectOne('/api/protected');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(capturedError).toBeTruthy();
      expect(authServiceSpy.clearTokens).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should queue concurrent requests during refresh and retry with new token', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(of({ accessToken: 'new-token' }));

      const p1 = lastValueFrom(httpClient.get('/api/data-1'));
      const p2 = lastValueFrom(httpClient.get('/api/data-2'));

      const req1 = httpMock.expectOne('/api/data-1');
      req1.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const req2 = httpMock.expectOne('/api/data-2');
      req2.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const retry1 = httpMock.expectOne('/api/data-1');
      expect(retry1.request.headers.get('Authorization')).toBe('Bearer new-token');
      retry1.flush({ data: 1 });

      const retry2 = httpMock.expectOne('/api/data-2');
      expect(retry2.request.headers.get('Authorization')).toBe('Bearer new-token');
      retry2.flush({ data: 2 });

      const [r1, r2] = await Promise.all([p1, p2]);
      expect(r1).toEqual({ data: 1 });
      expect(r2).toEqual({ data: 2 });
    });

    it('should not trigger multiple refreshes when already refreshing', async () => {
      localStorage.setItem('accessToken', 'expired-token');
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      authServiceSpy.refreshToken.and.returnValue(of({ accessToken: 'fresh-token' }));

      const p1 = lastValueFrom(httpClient.get('/api/a'));
      const p2 = lastValueFrom(httpClient.get('/api/b'));
      const p3 = lastValueFrom(httpClient.get('/api/c'));

      httpMock.expectOne('/api/a').flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/api/b').flush({}, { status: 401, statusText: 'Unauthorized' });
      httpMock.expectOne('/api/c').flush({}, { status: 401, statusText: 'Unauthorized' });

      httpMock.expectOne('/api/a').flush({});
      httpMock.expectOne('/api/b').flush({});
      httpMock.expectOne('/api/c').flush({});

      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
      expect(r1).toEqual({});
      expect(r2).toEqual({});
      expect(r3).toEqual({});
    });
  });
});
