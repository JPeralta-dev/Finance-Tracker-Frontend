import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProfileSectionComponent } from './profile-section.component';
import { AuthService } from '../../../core/services/auth.service';

describe('ProfileSectionComponent', () => {
  let component: ProfileSectionComponent;
  let fixture: ComponentFixture<ProfileSectionComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getProfile', 'clearTokens']);
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getProfile.and.returnValue(
      of({ id: '1', email: 'test@example.com', displayName: 'Test User', createdAt: '2024-01-01T00:00:00Z' })
    );

    await TestBed.configureTestingModule({
      imports: [ProfileSectionComponent, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    component.ngOnInit();
    expect(authServiceSpy.getProfile).toHaveBeenCalled();
  });
});
