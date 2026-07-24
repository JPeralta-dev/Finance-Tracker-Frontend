import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { FtReferralService } from './referral.service';
import { AuthService } from '../../core/services/auth.service';
import { FtAnalyticsService } from '../../core/services/analytics.service';

describe('FtReferralService', () => {
  let service: FtReferralService;
  let httpMock: jasmine.SpyObj<HttpClient>;
  let authMock: { currentUser: ReturnType<typeof signal<any>> };
  let analyticsMock: jasmine.SpyObj<FtAnalyticsService>;

  beforeEach(() => {
    localStorage.clear();
    httpMock = jasmine.createSpyObj<HttpClient>('HttpClient', ['post', 'get']);
    authMock = { currentUser: signal({ id: 'user-1', email: 'a@b.c', displayName: 'A' }) };
    analyticsMock = jasmine.createSpyObj<FtAnalyticsService>('FtAnalyticsService', ['trackEvent']);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpMock },
        { provide: AuthService, useValue: authMock },
        { provide: FtAnalyticsService, useValue: analyticsMock },
      ],
    });
    service = TestBed.inject(FtReferralService);
  });

  describe('isValidCode', () => {
    it('accepts 8-char base62 alphanumeric', () => {
      expect(service.isValidCode('ABC12345')).toBe(true);
      expect(service.isValidCode('abcd1234')).toBe(true);
      expect(service.isValidCode('aB1cD2eF')).toBe(true);
    });

    it('rejects codes with wrong length', () => {
      expect(service.isValidCode('ABC123')).toBe(false);
      expect(service.isValidCode('ABC123456')).toBe(false);
      expect(service.isValidCode('')).toBe(false);
    });

    it('rejects codes with non-base62 chars', () => {
      expect(service.isValidCode('ABC!2345')).toBe(false);
      expect(service.isValidCode('ABC 2345')).toBe(false);
      expect(service.isValidCode('ÁÉÍÓÚ1234')).toBe(false);
    });
  });

  describe('formatCode', () => {
    it('uppercases and strips invalid chars', () => {
      expect(service.formatCode('abc 123!xy')).toBe('ABC123XY');
    });
    it('truncates to 8 chars', () => {
      expect(service.formatCode('ABCDEFGHIJ')).toBe('ABCDEFGH');
    });
  });

  describe('share()', () => {
    beforeEach(async () => {
      httpMock.get.and.returnValue(of({ referralCount: 2, totalDiscountMonths: 2, pendingCount: 1 }));
      httpMock.post.and.returnValue(of({ code: 'TESTCODE', userId: 'user-1', createdAt: 'now' }));
      await service.ensureCode();
    });

    it('builds a mailto: URL for email', () => {
      const target = service.share('email');
      expect(target.method).toBe('email');
      expect(target.url.startsWith('mailto:')).toBe(true);
      expect(target.url).toContain('subject=');
    });

    it('builds a wa.me URL for whatsapp', () => {
      const target = service.share('whatsapp');
      expect(target.url.startsWith('https://wa.me/')).toBe(true);
    });

    it('builds a twitter intent URL', () => {
      const target = service.share('twitter');
      expect(target.url).toContain('twitter.com/intent/tweet');
    });

    it('builds a t.me share URL', () => {
      const target = service.share('telegram');
      expect(target.url).toContain('t.me/share/url');
      expect(target.url).toContain('url=');
    });
  });

  describe('ensureCode()', () => {
    it('calls backend and stores the code', async () => {
      httpMock.post.and.returnValue(of({ code: 'BACKEND1', userId: 'user-1', createdAt: 'now' }));
      httpMock.get.and.returnValue(of({ referralCount: 0, totalDiscountMonths: 0, pendingCount: 0 }));
      const code = await service.ensureCode();
      expect(code?.code).toBe('BACKEND1');
      expect(analyticsMock.trackEvent).toHaveBeenCalledWith('referral_link_generated', jasmine.objectContaining({ code: 'BACKEND1' }));
    });

    it('falls back to a local code when backend is offline', async () => {
      httpMock.post.and.returnValue(throwError(() => new Error('offline')));
      httpMock.get.and.returnValue(throwError(() => new Error('offline')));
      const code = await service.ensureCode();
      expect(code).toBeTruthy();
      expect(code!.code).toMatch(/^[A-Z0-9]{8}$/);
    });
  });

  describe('applyCode / consumeAppliedCode', () => {
    it('stores and reads the applied code', () => {
      expect(service.applyCode('ABCD1234')).toBe(true);
      expect(service.consumeAppliedCode()).toBe('ABCD1234');
      // Second call returns null (consumed)
      expect(service.consumeAppliedCode()).toBeNull();
    });

    it('rejects invalid codes without storing them', () => {
      expect(service.applyCode('SHORT')).toBe(false);
      expect(service.consumeAppliedCode()).toBeNull();
    });
  });
});
