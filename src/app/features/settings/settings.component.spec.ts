import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TelegramLinkService } from '../../core/services/telegram-link.service';
import { GmailLinkService } from '../../core/services/gmail-link.service';
import { User } from '../../core/models/user.model';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['logout', 'isAuthenticated', 'getProfile'],
    );
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getProfile.and.returnValue(
      of({
        id: 'test-id',
        displayName: 'Test User',
        email: 'test@example.com',
        createdAt: '2024-01-01',
      } as User),
    );

    const telegramLinkSpy = jasmine.createSpyObj('TelegramLinkService', [
      'status',
      'connect',
      'disconnect',
      'generateCode',
    ]);
    const gmailLinkSpy = jasmine.createSpyObj('GmailLinkService', [
      'status',
      'connect',
      'disconnect',
      'sync',
    ]);

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TelegramLinkService, useValue: telegramLinkSpy },
        { provide: GmailLinkService, useValue: gmailLinkSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have logoutLoading signal initialized to false', () => {
    expect(component.logoutLoading()).toBe(false);
  });

  // ── Phase 2.1 RED: Component Structure ─────────────────────────────────
  describe('component structure', () => {
    it('should render app-profile-section (RED — not yet in template)', () => {
      const el = fixture.debugElement.query(By.css('app-profile-section'));
      expect(el).toBeTruthy();
    });

    it('should NOT render app-security-section (RED — still in template)', () => {
      const el = fixture.debugElement.query(By.css('app-security-section'));
      expect(el).toBeNull();
    });

    it('should NOT render app-notifications-section (RED — still in template)', () => {
      const el = fixture.debugElement.query(
        By.css('app-notifications-section'),
      );
      expect(el).toBeNull();
    });

    it('should render app-linked-accounts-section', () => {
      const el = fixture.debugElement.query(
        By.css('app-linked-accounts-section'),
      );
      expect(el).toBeTruthy();
    });
  });

  // ── Phase 1.1 RED: i18n keys for profile section ──────────────────────
  describe('i18n profile keys (TranslationService)', () => {
    // The TranslationService reads translations from localStorage on init.
    // We seed it with current en.json content (without the new profile keys),
    // so translate() returns the raw key → RED.
    beforeEach(() => {
      localStorage.clear();

      localStorage.setItem(
        'flowr_translations',
        JSON.stringify({
          settings: {
            title: 'Settings',
            subtitle: 'Manage your account and integrations',
            signOut: 'Sign Out',
            back_to_dashboard: 'Back to dashboard',
            coming_soon: 'Coming Soon...',
            profile: {
              title: 'Profile',
              display_name: 'Display name',
              email: 'Email',
            },
            security: {
              title: 'Security',
              desc: 'Configure your account security.',
              coming_soon: 'Coming soon',
            },
            settings_notifications: {
              title: 'Notifications',
              desc: 'Configure how you receive notifications.',
              coming_soon: 'Coming soon',
            },
            session: {
              title: 'Session',
              sign_out: 'Sign out',
              confirm_message: 'Are you sure you want to sign out?',
              confirm_sign_out: 'Yes, sign out',
            },
            accounts: {
              title: 'Linked accounts',
              desc: 'Connect your messaging accounts.',
            },
            preferences: {
              title: 'Preferences',
              desc: 'Customize your experience.',
            },
          },
        }),
      );
      localStorage.setItem('flowr_language', 'en');
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should resolve settings.profile.title as "Profile" in English', () => {
      const service = TestBed.inject(TranslationService);
      // Key does NOT exist in above seed → returns raw key → FAILS (RED)
      expect(service.translate('settings.profile.title')).toBe('Profile');
    });

    it('should resolve settings.profile.display_name as "Display name" in English', () => {
      const service = TestBed.inject(TranslationService);
      expect(service.translate('settings.profile.display_name')).toBe('Display name');
    });

    it('should resolve settings.profile.email as "Email" in English', () => {
      const service = TestBed.inject(TranslationService);
      expect(service.translate('settings.profile.email')).toBe('Email');
    });
  });

  // ── Phase 4 RED: Page header with gear icon ───────────────────────────
  describe('page header with gear icon', () => {
    it('should render a gear icon button in the page header', () => {
      const btn = fixture.debugElement.query(By.css('.gear-btn'));
      expect(btn).toBeTruthy();
    });

    it('should have aria-label on the gear button', () => {
      const btn = fixture.debugElement.query(By.css('.gear-btn'));
      expect(btn.attributes['aria-label']).toBeTruthy();
    });

    it('should open the drawer when gear icon is clicked', () => {
      expect(component.showPreferencesDrawer()).toBe(false);
      const btn = fixture.debugElement.query(By.css('.gear-btn'));
      btn.nativeElement.click();
      fixture.detectChanges();
      expect(component.showPreferencesDrawer()).toBe(true);
    });

    it('should render the preferences drawer when open', () => {
      component.showPreferencesDrawer.set(true);
      fixture.detectChanges();
      const drawer = fixture.debugElement.query(By.css('.preferences-drawer'));
      expect(drawer).toBeTruthy();
    });

    it('should render preferences section inside the drawer', () => {
      component.showPreferencesDrawer.set(true);
      fixture.detectChanges();
      const prefs = fixture.debugElement.query(
        By.css('.preferences-drawer app-preferences-section'),
      );
      expect(prefs).toBeTruthy();
    });
  });

  // ── Phase 5 RED: Drawer behavior ──────────────────────────────────────
  describe('preferences drawer behavior', () => {
    beforeEach(() => {
      component.showPreferencesDrawer.set(true);
      fixture.detectChanges();
    });

    it('should close the drawer via close button', () => {
      const closeBtn = fixture.debugElement.query(By.css('.drawer-close'));
      closeBtn.nativeElement.click();
      fixture.detectChanges();
      expect(component.showPreferencesDrawer()).toBe(false);
    });

    it('should close the drawer via backdrop click', () => {
      const backdrop = fixture.debugElement.query(By.css('.drawer-backdrop'));
      backdrop.nativeElement.click();
      fixture.detectChanges();
      expect(component.showPreferencesDrawer()).toBe(false);
    });

    it('should close the drawer on ESC key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      fixture.detectChanges();
      expect(component.showPreferencesDrawer()).toBe(false);
    });

    it('should lock body scroll when drawer opens', () => {
      component.togglePreferencesDrawer(); // close (was open from beforeEach)
      expect(document.body.style.overflow).toBe('');
      component.togglePreferencesDrawer(); // reopen
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when drawer closes via backdrop', () => {
      const backdrop = fixture.debugElement.query(By.css('.drawer-backdrop'));
      backdrop.nativeElement.click();
      fixture.detectChanges();
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body scroll when drawer closes via close button', () => {
      const closeBtn = fixture.debugElement.query(By.css('.drawer-close'));
      closeBtn.nativeElement.click();
      fixture.detectChanges();
      expect(document.body.style.overflow).toBe('');
    });

    it('should hide the drawer when closed', () => {
      component.showPreferencesDrawer.set(false);
      fixture.detectChanges();
      const drawer = fixture.debugElement.query(By.css('.preferences-drawer'));
      expect(drawer).toBeNull();
    });
  });
});
