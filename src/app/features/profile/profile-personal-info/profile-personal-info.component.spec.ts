import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, input } from '@angular/core';
import { ProfilePersonalInfoComponent } from './profile-personal-info.component';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  template: `<app-profile-personal-info [profileForm]="profileForm" [delay]="50" />`,
  imports: [ReactiveFormsModule, ProfilePersonalInfoComponent],
})
class TestHostComponent {
  profileForm = input.required<FormGroup>();
}

describe('ProfilePersonalInfoComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockTranslationService = {
    translate: (key: string) => key,
  };

  let testForm: FormGroup;

  beforeEach(async () => {
    testForm = new FormGroup({
      displayName: new FormControl('Test User', [Validators.required]),
      email: new FormControl({ value: 'test@example.com', disabled: true }),
    });

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
  });

  it('should create', () => {
    (hostComponent as any).profileForm = testForm;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-card')).toBeTruthy();
  });

  it('should render display name input bound to form', () => {
    (hostComponent as any).profileForm = testForm;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#displayName');
    expect(input).toBeTruthy();
    expect(input.value).toBe('Test User');
  });

  it('should render email input as readonly', () => {
    (hostComponent as any).profileForm = testForm;
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#email');
    expect(input).toBeTruthy();
    expect(input.readOnly).toBeTrue();
    expect(input.value).toBe('test@example.com');
  });

  it('should show required error when displayName is empty and touched', () => {
    (hostComponent as any).profileForm = testForm;
    fixture.detectChanges();

    testForm.get('displayName')?.setValue('');
    testForm.get('displayName')?.markAsTouched();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.form-error');
    expect(errorEl).toBeTruthy();
  });
});
