import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LinkedAccountsSectionComponent } from './linked-accounts-section.component';
import { TelegramLinkService } from '../../../core/services/telegram-link.service';
import { AuthService } from '../../../core/services/auth.service';

describe('LinkedAccountsSectionComponent', () => {
  let component: LinkedAccountsSectionComponent;
  let fixture: ComponentFixture<LinkedAccountsSectionComponent>;
  let svcSpy: jasmine.SpyObj<TelegramLinkService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('TelegramLinkService', ['generateCode', 'openTelegram', 'openTelegramWithCode'], {
      state: signal('idle'),
      linkCode: signal<string | null>(null),
      telegramId: signal<string | null>(null),
      countdown: signal(0),
      error: signal<string | null>(null),
      justLinked: signal(false),
    });

    authSpy = jasmine.createSpyObj('AuthService', ['signInWithGoogle']);

    await TestBed.configureTestingModule({
      imports: [LinkedAccountsSectionComponent],
      providers: [
        { provide: TelegramLinkService, useValue: svcSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkedAccountsSectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject TelegramLinkService', () => {
    expect(component.svc).toBeTruthy();
  });

  it('should compute countdownMinutes', () => {
    (svcSpy.countdown as any).set(125);
    expect(component.countdownMinutes).toBe(2);
  });

  it('should compute countdownSeconds', () => {
    (svcSpy.countdown as any).set(125);
    expect(component.countdownSeconds).toBe(5);
  });

  it('should start in idle gmail state', () => {
    expect(component.gmailState()).toBe('idle');
  });

  it('connectGmail should delegate to AuthService.signInWithGoogle with scopes', () => {
    component.connectGmail();
    expect(authSpy.signInWithGoogle).toHaveBeenCalledTimes(1);
    const scopes = authSpy.signInWithGoogle.calls.mostRecent().args[0];
    expect(scopes).toEqual(jasmine.arrayContaining([
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ]));
    expect(component.gmailState()).toBe('connecting');
  });

  it('connectGmail should be a no-op when already connecting', () => {
    component.connectGmail();
    component.connectGmail();
    expect(authSpy.signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
