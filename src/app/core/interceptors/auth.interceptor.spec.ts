import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule,
} from '@angular/common/http/testing';
import { HttpClient, HttpRequest } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
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
});
