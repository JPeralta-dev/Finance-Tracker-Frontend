import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkedAccountsSectionComponent } from './linked-accounts-section.component';
import { TelegramLinkService } from '../../../core/services/telegram-link.service';

describe('LinkedAccountsSectionComponent', () => {
  let component: LinkedAccountsSectionComponent;
  let fixture: ComponentFixture<LinkedAccountsSectionComponent>;
  let svcSpy: jasmine.SpyObj<TelegramLinkService>;

  beforeEach(async () => {
    svcSpy = jasmine.createSpyObj('TelegramLinkService', ['generateCode', 'openTelegram', 'openTelegramWithCode'], {
      state: jasmine.createSignal('idle'),
      linkCode: jasmine.createSignal(null),
      telegramId: jasmine.createSignal(null),
      countdown: jasmine.createSignal(0),
      error: jasmine.createSignal(null),
      justLinked: jasmine.createSignal(false),
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
    svcSpy.countdown = jasmine.createSignal(125);
    expect(component.countdownMinutes).toBe(2);
  });

  it('should compute countdownSeconds', () => {
    svcSpy.countdown = jasmine.createSignal(125);
    expect(component.countdownSeconds).toBe(5);
  });
});
