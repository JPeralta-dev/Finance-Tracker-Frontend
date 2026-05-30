import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileSectionComponent } from './profile-section.component';
import { AuthService } from '../../../core/services/auth.service';

describe('ProfileSectionComponent', () => {
  let component: ProfileSectionComponent;
  let fixture: ComponentFixture<ProfileSectionComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getProfile', 'clearTokens']);
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getProfile.and.returnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({ email: 'test@example.com', displayName: 'Test User' });
      },
    });

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
