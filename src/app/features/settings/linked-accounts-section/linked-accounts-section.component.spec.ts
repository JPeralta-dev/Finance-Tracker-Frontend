import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LinkedAccountsSectionComponent } from './linked-accounts-section.component';
import { TelegramLinkService } from '../../../core/services/telegram-link.service';

describe('LinkedAccountsSectionComponent', () => {
  let component: LinkedAccountsSectionComponent;
  let fixture: ComponentFixture<LinkedAccountsSectionComponent>;
  let svcSpy: jasmine.SpyObj<TelegramLinkService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('TelegramLinkService', ['generateCode', 'openTelegram', 'openTelegramWithCode'], {
      state: signal('idle'),
      linkCode: signal<string | null>(null),
      telegramId: signal<string | null>(null),
      countdown: signal(0),
      error: signal<string | null>(null),
      justLinked: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [LinkedAccountsSectionComponent],
      providers: [{ provide: TelegramLinkService, useValue: svcSpy }],
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
});
