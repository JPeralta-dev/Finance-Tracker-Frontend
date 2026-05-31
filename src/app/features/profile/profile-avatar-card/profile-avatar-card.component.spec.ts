import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { ProfileAvatarCardComponent } from './profile-avatar-card.component';
import type { User } from '../../../core/models/user.model';

@Component({
  template: `<app-profile-avatar-card [user]="user" [initials]="initials" />`,
  imports: [ProfileAvatarCardComponent],
})
class TestHostComponent {
  user = input.required<User | null>();
  initials = input.required<string>();
}

describe('ProfileAvatarCardComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: '2024-01-15T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
  });

  it('should create', () => {
    (hostComponent as any).user = mockUser;
    (hostComponent as any).initials = 'TU';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-avatar-card')).toBeTruthy();
  });

  it('should render user display name', () => {
    (hostComponent as any).user = mockUser;
    (hostComponent as any).initials = 'TU';
    fixture.detectChanges();

    const nameEl = fixture.nativeElement.querySelector('.avatar-name');
    expect(nameEl.textContent.trim()).toBe('Test User');
  });

  it('should render user email', () => {
    (hostComponent as any).user = mockUser;
    (hostComponent as any).initials = 'TU';
    fixture.detectChanges();

    const emailEl = fixture.nativeElement.querySelector('.avatar-email');
    expect(emailEl.textContent.trim()).toBe('test@example.com');
  });

  it('should render initials in avatar circle', () => {
    (hostComponent as any).user = mockUser;
    (hostComponent as any).initials = 'TU';
    fixture.detectChanges();

    const avatarEl = fixture.nativeElement.querySelector('.avatar-circle');
    expect(avatarEl.textContent.trim()).toBe('TU');
  });

  it('should fallback to email prefix when no displayName', () => {
    const userWithoutName: User = {
      id: '2',
      email: 'john@example.com',
      createdAt: '2024-01-15T00:00:00Z',
    };
    (hostComponent as any).user = userWithoutName;
    (hostComponent as any).initials = 'J';
    fixture.detectChanges();

    const nameEl = fixture.nativeElement.querySelector('.avatar-name');
    expect(nameEl.textContent.trim()).toBe('john');
  });
});
