import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { ProfileDropdownTriggerComponent } from './profile-dropdown-trigger.component';

@Component({
  template: `<app-profile-dropdown-trigger
    [initials]="initials"
    [displayName]="displayName"
    [isOpen]="isOpen"
    (toggled)="onToggled()"
  />`,
  imports: [ProfileDropdownTriggerComponent],
})
class TestHostComponent {
  initials = 'JD';
  displayName = 'John Doe';
  isOpen = false;
  toggledCount = 0;
  onToggled() { this.toggledCount++; }
}

describe('ProfileDropdownTriggerComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.nativeElement.querySelector('.profile-dropdown__trigger')).toBeTruthy();
  });

  it('should render initials in avatar', () => {
    const avatar = fixture.nativeElement.querySelector('.profile-dropdown__avatar');
    expect(avatar.textContent.trim()).toBe('JD');
  });

  it('should render display name', () => {
    const name = fixture.nativeElement.querySelector('.profile-dropdown__name');
    expect(name.textContent.trim()).toBe('John Doe');
  });

  it('should emit toggled event on click', () => {
    const btn = fixture.nativeElement.querySelector('.profile-dropdown__trigger');
    btn.click();
    expect(hostComponent.toggledCount).toBe(1);
  });

  it('should set aria-expanded based on isOpen input', () => {
    hostComponent.isOpen = true;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.profile-dropdown__trigger');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });
});
