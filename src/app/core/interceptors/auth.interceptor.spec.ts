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
    clearSession: jasmine.Spy;
  };
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = {
      clearSession: jasmine.createSpy('clearSession'),
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
    resetInterceptorState();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should set withCredentials on all requests', async () => {
    const responsePromise = lastValueFrom(httpClient.get('/api/test'));

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ data: 'test' });

    const response = await responsePromise;
    expect(response).toEqual({ data: 'test' });
  });

  describe('Session Refresh on 401', () => {
    it('should refresh session on 401 and retry the original request', async () => {
      const responsePromise = lastValueFrom(httpClient.get('/api/protected'));

      const firstReq = httpMock.expectOne('/api/protected');
      firstReq.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // Interceptor calls session refresh endpoint
      const refreshReq = httpMock.expectOne(r => r.url.endsWith('/session/refresh'));
      expect(refreshReq.request.method).toBe('POST');
      expect(refreshReq.request.withCredentials).toBeTrue();
      refreshReq.flush({});

      // Retry the original request
      const retryReq = httpMock.expectOne('/api/protected');
      expect(retryReq.request.withCredentials).toBeTrue();
      retryReq.flush({ data: 'success' });

      const response = await responsePromise;
      expect(response).toEqual({ data: 'success' });
    });

    it('should call clearSession and navigate when refresh fails', async () => {
      let capturedError: any;
      httpClient.get('/api/protected').subscribe({
        error: (error) => { capturedError = error; },
      });

      const req = httpMock.expectOne('/api/protected');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });

      const refreshReq = httpMock.expectOne(r => r.url.endsWith('/session/refresh'));
      refreshReq.flush(null, { status: 401, statusText: 'Unauthorized' });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(capturedError).toBeTruthy();
      expect(authServiceSpy.clearSession).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
