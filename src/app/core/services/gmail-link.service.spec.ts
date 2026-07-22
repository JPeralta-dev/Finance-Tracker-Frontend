import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { GmailLinkService } from './gmail-link.service';

describe('GmailLinkService', () => {
  let svc: GmailLinkService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  const mockStatus = {
    connected: true,
    email: 'me@example.com',
    lastSyncAt: '2026-07-22T10:00:00Z',
    lastTransactions: [
      { id: '1', bankName: 'Bancolombia', amount: 85250, currency: 'COP', receivedAt: '2026-07-22T09:00:00Z' },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    httpSpy.get.and.returnValue(of(mockStatus));

    TestBed.configureTestingModule({
      providers: [
        GmailLinkService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    svc = TestBed.inject(GmailLinkService);
  });

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  it('should start fetching status on construction', () => {
    expect(httpSpy.get).toHaveBeenCalledWith(jasmine.stringMatching(/gmail-status$/));
  });

  it('should mark connected when status returns connected=true', fakeAsync(() => {
    svc.refreshStatus();
    tick();
    expect(svc.state()).toBe('connected');
    expect(svc.email()).toBe('me@example.com');
    expect(svc.lastTransactions().length).toBe(1);
    flush();
  }));

  it('should mark idle when status returns connected=false', fakeAsync(() => {
    httpSpy.get.and.returnValue(of({ connected: false, email: null, lastSyncAt: null, lastTransactions: [] }));
    svc = TestBed.inject(GmailLinkService);
    tick();
    expect(svc.state()).toBe('idle');
    expect(svc.email()).toBeNull();
    flush();
  }));

  it('should fall back to idle on status fetch error', fakeAsync(() => {
    httpSpy.get.and.returnValue(throwError(() => new Error('boom')));
    svc = TestBed.inject(GmailLinkService);
    tick();
    expect(svc.state()).toBe('idle');
    flush();
  }));

  it('should call sync endpoint and refresh status', fakeAsync(() => {
    const syncResp = { imported: 2, lastSyncAt: '2026-07-22T11:00:00Z' };
    httpSpy.post.and.returnValue(of(syncResp));
    svc.state.set('connected');
    svc.syncNow();
    tick();
    expect(svc.syncing()).toBeFalse();
    expect(httpSpy.post).toHaveBeenCalledWith(jasmine.stringMatching(/sync-gmail$/), {});
    flush();
  }));

  it('should set error on sync failure', fakeAsync(() => {
    httpSpy.post.and.returnValue(throwError(() => new Error('boom')));
    svc.state.set('connected');
    svc.syncNow();
    tick();
    expect(svc.syncing()).toBeFalse();
    expect(svc.error()).toBe('settings.gmail.sync_failed');
    flush();
  }));

  it('should not sync when not connected', () => {
    svc.state.set('idle');
    svc.syncNow();
    expect(httpSpy.post).not.toHaveBeenCalled();
  });

  it('should not sync twice while already syncing', fakeAsync(() => {
    httpSpy.post.and.returnValue(of({ imported: 0, lastSyncAt: '' }));
    svc.state.set('connected');
    svc.syncNow();
    svc.syncNow();
    tick();
    expect(httpSpy.post).toHaveBeenCalledTimes(1);
    flush();
  }));

  it('markDisconnected should reset all signals', () => {
    svc.state.set('connected');
    svc.email.set('me@example.com');
    svc.markDisconnected();
    expect(svc.state()).toBe('idle');
    expect(svc.email()).toBeNull();
    expect(svc.lastSyncAt()).toBeNull();
    expect(svc.lastTransactions().length).toBe(0);
  });

  it('isBusy should reflect transient states', () => {
    svc.state.set('idle');
    expect(svc.isBusy()).toBeFalse();
    svc.syncing.set(true);
    expect(svc.isBusy()).toBeTrue();
    svc.syncing.set(false);
    svc.state.set('connecting');
    expect(svc.isBusy()).toBeTrue();
  });
});
