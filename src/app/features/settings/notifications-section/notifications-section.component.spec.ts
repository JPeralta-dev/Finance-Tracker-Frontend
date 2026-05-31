import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsSectionComponent } from './notifications-section.component';

describe('NotificationsSectionComponent', () => {
  let component: NotificationsSectionComponent;
  let fixture: ComponentFixture<NotificationsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsSectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept delay input', () => {
    expect(component.delay()).toBe(0);
  });
});
